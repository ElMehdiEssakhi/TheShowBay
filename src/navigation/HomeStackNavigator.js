import HomeScreen from "../screens/HomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ShowScreen from "../screens/ShowScreen";
import AllReviewsScreen from "../screens/AllReviewsScreen";
const HomeStack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} 
      options={{
            headerShown: false
        }}
      />
      <HomeStack.Screen name="Show" component={ShowScreen}
      options={{
            headerShown: false
        }}
      />
      <HomeStack.Screen name="AllReviews" component={AllReviewsScreen}
      options={{
            headerShown: false
        }}
      />
    </HomeStack.Navigator>
  );
}
