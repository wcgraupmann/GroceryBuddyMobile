import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView

const LandingScreen = ({ navigation }) => {
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
          <Text style={styles.buttonText}>Go to Grocery List</Text>
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LandingScreen;
