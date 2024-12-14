import { React, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import { GroupContext } from "../../Context/GroupContext";
import * as SecureStore from "expo-secure-store";

const LandingScreen = ({ navigation }) => {
  const { groupIds, setGroupIds } = useContext(GroupContext);

  useEffect(() => {
    const getGroupIds = async () => {
      try {
        const token = await SecureStore.getItemAsync("jwt_token");
        if (!token) {
          console.log(
            "Token expired or not found. Redirecting to login screen."
          );
          return;
        }
        const response = await fetch("http://192.168.2.63:3000/groupIds", {
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        const { groupIds } = data;
        setGroupIds(groupIds);
        console.log("fetched groupIds", groupIds);
      } catch (error) {
        console.error("Error signing in:", error.message);
      }
    };

    getGroupIds();

    // getGroupIds();
  }, [setGroupIds]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grocery Buddy</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.description}>
          This is the landing page of the grocery app.
        </Text>

        {/* Example Button for Navigation */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("GroceryList")}
        >
          <Text style={styles.buttonText}>Grocery List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("TransactionScreen")}
        >
          <Text style={styles.buttonText}>Previous Transactions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#6200ee", // Purple background
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LandingScreen;
