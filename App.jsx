import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import jwtDecode from "jwt-decode"; // To decode the JWT token
import { useState, useEffect } from "react";
import LandingScreen from "./src/components/screens/LandingScreen";
import SignInScreen from "./src/components/screens/SignInScreen";
import GroceryListScreen from "./src/components/screens/GroceryListScreen";
import { TouchableOpacity } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Main app stack (after login)
  const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="GroceryList" component={GroceryListScreen} />
    </Stack.Navigator>
  );

  // Authentication stack (sign-in screen only)
  const AuthStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="SignIn">
        {() => <SignInScreen setIsAuthenticated={setIsAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  );

  useEffect(() => {
    // Check if user is already authenticated and token is valid
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("jwt_token");
      if (token) {
        try {
          const decoded = jwtDecode(token); // Decode the JWT token
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          if (decoded.exp > currentTime) {
            setIsAuthenticated(true);
            scheduleLogout(decoded.exp - currentTime); // Schedule automatic logout
          } else {
            await SecureStore.deleteItemAsync("jwt_token"); // Remove expired token
          }
        } catch (error) {
          console.error("Invalid token format", error);
          await SecureStore.deleteItemAsync("jwt_token"); // Remove invalid token
        }
      }
    };
    checkAuth();
  }, []);

  const scheduleLogout = (timeUntilExpiration) => {
    setTimeout(async () => {
      await SecureStore.deleteItemAsync("jwt_token"); // Delete the JWT token
      setIsAuthenticated(false); // Log out the user
    }, timeUntilExpiration * 1000); // Convert seconds to milliseconds
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("jwt_token"); // Delete the JWT token
    setIsAuthenticated(false); // Update the authentication state
  };

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#6200ee",
              height: 65,
              paddingBottom: 12,
            },
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={MainStack} />

          {/* Logout button */}
          <Tab.Screen
            name="Logout"
            component={LandingScreen} // Placeholder, logout doesn't require a screen
            options={{
              tabBarButton: () => (
                <TouchableOpacity onPress={handleLogout}>
                  <Ionicons name="log-out" size={30} color="#fff" />
                </TouchableOpacity>
              ),
              tabBarLabel: () => null, // Hide the label for the logout button
            }}
          />
        </Tab.Navigator>
      ) : (
        <AuthStack setIsAuthenticated={setIsAuthenticated} />
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
