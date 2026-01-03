import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebase/config";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer , DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ShowScreen from "./src/screens/ShowScreen";
import TabNavigator from "./src/navigation/TabNavigator";
import WatchlistScreen from "./src/screens/WatchList";

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#020617", // <--- THIS FIXES THE FLASH
    card: "#020617",       
    text: "#f8fafc",
    border: "#0f172a",     
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // optional: to wait for auth check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#020617", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is logged in
          <>
          {/* Bottom Tabs */}
          <Stack.Screen name="Tabs" component={TabNavigator} />
          </>
        ) : (
          // User is not logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
