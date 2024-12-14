import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message"; // Import Toast
import { GroupContext } from "../../Context/GroupContext";

const GroceryListScreen = () => {
  const [groceryList, setGroceryList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchedItems, setTouchedItems] = useState({});
  const navigation = useNavigation();
  const { groupIds, setGroupIds } = useContext(GroupContext);

  useEffect(() => {
    fetchGroceryList();
  }, []);

  useEffect(() => {
    fetchGroceryList();

    // Define the interval to refetch the grocery list every 10 seconds
    const interval = setInterval(() => {
      fetchGroceryList();
    }, 10000); // 10 seconds

    // Cleanup interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const fetchGroceryList = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt_token");

      if (!token) {
        console.log("Token expired or not found. Redirecting to login screen.");
        navigation.navigate("SignIn");
        return;
      }

      const response = await fetch("http://192.168.2.63:3000/groceryList", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupIds[0] }),
      });

      if (response.status === 200) {
        const data = await response.json();
        const { groceryList } = data;
        setGroceryList(groceryList);
      } else {
        console.log("Error fetching grocery list:", response.status);
      }
    } catch (error) {
      console.error("Error fetching grocery list:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchGroceryList();
  };

  const handleItemPress = (category, itemId) => {
    setTouchedItems((prevTouchedItems) => {
      const newTouchedItems = { ...prevTouchedItems };
      const key = `${category}-${itemId}`;
      newTouchedItems[key] = !newTouchedItems[key];
      return newTouchedItems;
    });
  };

  const removeItemFromBackend = async (item, dateId) => {
    try {
      console.log("itemId:", item);
      const token = await SecureStore.getItemAsync("jwt_token");

      if (!token) {
        console.log("Token expired or not found. Redirecting to login screen.");
        navigation.navigate("SignIn");
        return;
      }

      const response = await fetch("http://192.168.2.63:3000/itemCheckout", {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.itemId,
          category: item.category,
          dateId,
          groupId: groupIds[0],
        }),
      });

      if (response.status === 200) {
        console.log("Item removed successfully");
      } else {
        console.log("Error deleting selected items:", response.status);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  };

  const removeSelectedItemsFromList = async () => {
    const selectedItems = Object.keys(touchedItems)
      .filter((key) => touchedItems[key])
      .map((key) => {
        const [category, itemId] = key.split("-");
        return { category, itemId };
      });

    if (selectedItems.length === 0) {
      return;
    }

    console.log("selectedItems", selectedItems);

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const dateId = `${month} ${day} ${year}`;

    selectedItems.forEach(async (item) => {
      await removeItemFromBackend(item, dateId);
    });
    // Clear the touched items state after deleting the items
    setTouchedItems({});
    // Fetch the updated grocery list
    fetchGroceryList();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </SafeAreaView>
    );
  }

  const renderCategory = ({ item: { category, items } }) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isTouched = touchedItems[`${category}-${item.id}`];
            return (
              <TouchableOpacity
                onPress={() => handleItemPress(category, item.id)}
                style={[
                  styles.itemContainer,
                  { backgroundColor: isTouched ? "green" : "#f1f1f1" },
                ]}
              >
                <Text style={isTouched ? styles.touchedItemText : null}>
                  {item.item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const groceryListData = Object.keys(groceryList).map((category) => ({
    category,
    items: groceryList[category],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Grocery List</Text>
      </View>

      {/* Check if grocery list is empty */}
      {groceryList &&
      Object.keys(groceryList).every(
        (category) => groceryList[category].length === 0
      ) ? (
        <View style={styles.centered}>
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={groceryListData}
          keyExtractor={(item) => item.category}
          renderItem={renderCategory}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon={() => <Icon name="check" size={24} color="white" />}
        onPress={removeSelectedItemsFromList}
        disabled={Object.values(touchedItems).every((isTouched) => !isTouched)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#6200ee",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6200ee",
    borderWidth: 2,
    borderColor: "#6200ee",
    paddingVertical: 5,
    paddingHorizontal: 10,
    textAlign: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  itemContainer: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginBottom: 5,
  },
  touchedItemText: {
    color: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6200ee",
  },
  emptyCartText: {
    fontSize: 18,
    color: "#6200ee",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default GroceryListScreen;
