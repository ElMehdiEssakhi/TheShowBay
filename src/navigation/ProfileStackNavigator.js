import ProfileScreen from "../screens/ProfileScreen";
import ShowScreen from "../screens/ShowScreen";
import WatchlistScreen from "../screens/WatchList";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Favorites from "../screens/Favorites";
import SettingStackNavigator from "./SettingStackNavigator";
import MyListsScreen from "../screens/MyListsScreen";
import ListScreen from "../screens/ListScreen";
import MyReviewsScreen from "../screens/MyReviewsScreen";
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
      <ProfileStack.Screen name="Show" component={ShowScreen}
      options={{
            headerShown: false
        }}
      />
      <ProfileStack.Screen name="MyReviews" component={MyReviewsScreen}
      options={{
            headerShown: false
        }}
      />
      <ProfileStack.Screen name="Favorites" component={Favorites}
      options={{
            headerShown: false
        }}
      />
      <ProfileStack.Screen name="MyLists" component={MyListsScreen}
      options={{
            headerShown: false
        }}
      />
      <ProfileStack.Screen name="ListShows" component={ListScreen}
      options={{
            headerShown: false
        }}
      />
      <ProfileStack.Screen name="Settings" component={SettingStackNavigator}
      options={{
            headerShown: false
        }}
      />
    </ProfileStack.Navigator>
  );
}
