import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Button, // Import Button
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView

const GroceryListScreen = () => {
  const [groceryList, setGroceryList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [touchedItems, setTouchedItems] = useState({}); // Track touched items
  const navigation = useNavigation();

  useEffect(() => {
    // Call the function to fetch the grocery list when the component mounts
    fetchGroceryList();
  }, []);

  const fetchGroceryList = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt_token"); // Retrieve the token

      if (!token) {
        console.log("Token expired or not found. Redirecting to login screen.");
        navigation.navigate("SignIn");
        return;
      }

      // Make the API request to fetch the grocery list
      const response = await fetch("http://192.168.2.63:3000/groceryList", {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
        },
      });

      // If the request is successful, store the grocery list in state
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
      setLoading(false); // Stop loading animation
    }
  };

  const handleItemPress = (category, itemId) => {
    setTouchedItems((prevTouchedItems) => {
      const newTouchedItems = { ...prevTouchedItems };
      const key = `${category}-${itemId}`; // Unique key for each item
      newTouchedItems[key] = !newTouchedItems[key]; // Toggle the touched state
      return newTouchedItems;
    });
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

  // Render a section for each grocery category
  const renderCategory = ({ item: { category, items } }) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isTouched = touchedItems[`${category}-${item.id}`]; // Check if the item was touched
            return (
              <TouchableOpacity
                onPress={() => handleItemPress(category, item.id)} // Handle touch event
                style={[
                  styles.itemContainer,
                  { backgroundColor: isTouched ? "green" : "#f1f1f1" }, // Toggle color based on touched state
                ]}
              >
                {/* Ensure that item text is inside the Text component */}
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

  // Convert groceryList object into an array of category objects
  const groceryListData = Object.keys(groceryList).map((category) => ({
    category,
    items: groceryList[category],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Wrap in SafeAreaView */}
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Grocery List</Text>
      </View>
      <FlatList
        data={groceryListData}
        keyExtractor={(item) => item.category}
        renderItem={renderCategory}
        contentContainerStyle={styles.scrollContainer}
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
    color: "#fff", // White text when the item is touched
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GroceryListScreen;
