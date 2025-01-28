import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { GroupContext } from "../../Context/GroupContext";

const GroceryListScreen = () => {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null); // Track expanded category
  const navigation = useNavigation();
  const { groupIds } = useContext(GroupContext);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // Define the interval to refetch the grocery list every 10 seconds
    const interval = setInterval(() => {
      fetchTransactions();
    }, 10000); // 10 seconds

    // Cleanup interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt_token");

      if (!token) {
        console.log("Token expired or not found. Redirecting to login screen.");
        navigation.navigate("SignIn");
        return;
      }

      const response = await fetch("http://192.168.1.27:3000/groceryList", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: groupIds[0] }),
      });

      if (response.status === 200) {
        const data = await response.json();
        const { transactions } = data;
        setTransactions(transactions);
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
    fetchTransactions();
  };

  const toggleCategory = (category) => {
    // Toggle category expansion/collapse
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const formatDate = (dateStr) => {
    // Convert "MM DD YYYY" format to Date object
    const [month, day, year] = dateStr.split(" ");
    const formattedDate = new Date(`${year}-${month}-${day}`);

    // Format the date to a more readable format: "Month Day, Year"
    return formattedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
      </SafeAreaView>
    );
  }

  // Iterate through the transaction object, using dates as keys
  const transactionDates = Object.keys(transactions || {});
  const groceryListData = transactionDates.map((date) => ({
    category: date,
    items: transactions[date],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Grocery List</Text>
      </View>

      {groceryListData.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={groceryListData}
          keyExtractor={(item) => item.category}
          renderItem={({ item: { category, items } }) => {
            // Get the first buyer from the items list
            const buyer = items.length > 0 ? items[0].buyer : "";

            return (
              <View style={styles.categoryContainer}>
                <TouchableOpacity onPress={() => toggleCategory(category)}>
                  <Text style={styles.categoryTitle}>
                    {formatDate(category)}
                  </Text>
                </TouchableOpacity>

                {/* Only render items if the category is expanded */}
                {expandedCategory === category && (
                  <View>
                    {/* Display buyer name at the top */}
                    {buyer && (
                      <Text style={styles.buyerText}>
                        Purchased by: {buyer.toUpperCase()}
                      </Text>
                    )}

                    <FlatList
                      data={items}
                      keyExtractor={(item) => item.item} // Use item name as key
                      renderItem={({ item }) => (
                        <View key={item.item} style={styles.itemContainer}>
                          <Text style={styles.itemText}>
                            {item.item.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      {/* The FAB no longer has a remove function */}
      {/* <FAB
        style={styles.fab}
        icon={() => <Icon name="check" size={24} color="white" />}
        disabled
      /> */}
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
  itemText: {
    fontSize: 16,
  },
  buyerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 10,
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
