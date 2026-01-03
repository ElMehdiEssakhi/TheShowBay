import ProfileScreen from "../screens/ProfileScreen";
import WatchlistScreen from "../screens/WatchList";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const ProfileStack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen}
      options={{
            headerShown: false
        }}
      />
      <ProfileStack.Screen name="Watchlist" component={WatchlistScreen}
      options={{
            headerShown: false
        }}
      />
    </ProfileStack.Navigator>
  );
}
