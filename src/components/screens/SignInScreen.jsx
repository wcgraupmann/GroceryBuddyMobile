import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store"; // Secure storage
import { GroupContext } from "../../Context/GroupContext";

const SignInScreen = ({ navigation, setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setGroupIds } = useContext(GroupContext);

  // const getGroupIds = async () => {
  //   try {
  //     const token = await SecureStore.getItemAsync("jwt_token");
  //     if (!token) {
  //       console.log("Token expired or not found. Redirecting to login screen.");
  //       return;
  //     }
  //     const response = await fetch("http://192.168.2.63:3000/groupIds", {
  //       method: "get",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch user data");
  //     }
  //     const data = await response.json();
  //     const { groupIds } = data;
  //     setGroupIds(groupIds);
  //     console.log("fetched groupIds", groupIds);
  //   } catch (error) {
  //     console.error("Error signing in:", error.message);
  //   }
  // };

  const handleSignIn = async () => {
    try {
      console.log("Attempting to sign in...");

      // 192.168.1.27
      const response = await fetch("http://192.168.1.27:3000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("got past response");

      if (!response.ok) {
        const error = await response.json();
        console.log("Error response:", error);
        setError(error.error || "Invalid email or password.");
        return;
      } else {
        const data = await response.json();
        const { token, groupIds } = data;
        console.log("Sign-in success:");

        // Store the JWT token securely
        await SecureStore.setItemAsync("jwt_token", token);

        setGroupIds(groupIds);
        setIsAuthenticated(true); // Update authentication status and redirect to main screen
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 },
  error: { color: "red", marginBottom: 12 },
});

export default SignInScreen;
