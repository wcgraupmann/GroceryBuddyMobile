import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store"; // Secure storage
import { useState, useEffect } from "react";
import LandingScreen from "./src/components/screens/LandingScreen"; // Your main screen
import SignInScreen from "./src/components/screens/SignInScreen"; // Your sign-in screen
import GroceryListScreen from "./src/components/screens/GroceryListScreen"; // Your grocery list screen
import { TouchableOpacity } from "react-native"; // Import TouchableOpacity

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main app stack (after login)
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="GroceryList" component={GroceryListScreen} />
    {/* Add other screens if needed */}
  </Stack.Navigator>
);

// Authentication stack (sign-in screen only)
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    {/* Add more screens as needed */}
  </Stack.Navigator>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated by checking the token
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("jwt_token");
      if (token) {
        setIsAuthenticated(true); // If token exists, user is authenticated
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("jwt_token"); // Delete the JWT token
    setIsAuthenticated(false); // Update the authentication state
  };

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // Show main app screen if authenticated
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
            component={LandingScreen} // This is just a placeholder, logout doesn't require a screen
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
        // Show sign-in screen if not authenticated
        <AuthStack />
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
