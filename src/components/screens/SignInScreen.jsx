import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store"; // Secure storage

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    try {
      const response = await fetch("http://192.168.2.63:3000/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token } = data;

        // Store the JWT token securely
        await SecureStore.setItemAsync("jwt_token", token);

        // Update authentication status and redirect to main screen
        navigation.navigate("Landing"); // Or any screen in the main app
      } else {
        setError("Invalid email or password.");
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
