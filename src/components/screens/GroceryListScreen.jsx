import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl, // Import RefreshControl
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "react-native-paper"; // Import FAB component
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Import icon

const GroceryListScreen = () => {
  const [groceryList, setGroceryList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Refreshing state
  const [touchedItems, setTouchedItems] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchGroceryList();
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      setIsRefreshing(false); // Stop refreshing indicator
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

  const removeItemFromBackend = async (item) => {
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
        body: JSON.stringify({ itemId: item.itemId, category: item.category }),
      });

      if (response.status === 200) {
        // alert("Selected item deleted.");
        // fetchGroceryList(); // Refresh the list after deletion
      } else {
        console.log("Error deleting selected items:", response.status);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  };

  // Function to delete selected items
  const removeSelectedItemsFromList = async () => {
    try {
      const selectedItems = Object.keys(touchedItems)
        .filter((key) => touchedItems[key])
        .map((key) => {
          const [category, itemId] = key.split("-");
          return { category, itemId };
        });

      if (selectedItems.length === 0) {
        // alert("No items selected.");
        // TODO: change FAB to green once an item is selected
        return;
      }

      console.log(selectedItems);

      selectedItems.forEach((item, category) => {
        removeItemFromBackend(item, category);
      });
      fetchGroceryList(); // Refresh the list after deletion

      //   const response = await fetch("http://192.168.2.63:3000/deleteItems", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ items: selectedItems }),
      //   });

      //   if (response.status === 200) {
      //     alert("Selected items deleted.");
      //     fetchGroceryList(); // Refresh the list after deletion
      //   } else {
      //     console.log("Error deleting selected items:", response.status);
      //   }
    } catch (error) {
      console.error("Error deleting selected items:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </SafeAreaView>
    );
  }

  if (!groceryList) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No grocery list available. Please try again later.</Text>
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
                  {item.item}
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
      <FlatList
        data={groceryListData}
        keyExtractor={(item) => item.category}
        renderItem={renderCategory}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon={() => <Icon name="check" size={24} color="white" />}
        onPress={removeSelectedItemsFromList}
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
});

export default GroceryListScreen;
