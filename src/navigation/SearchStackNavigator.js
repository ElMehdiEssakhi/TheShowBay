import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SearchScreen from "../screens/SearchScreen";
import ShowScreen from "../screens/ShowScreen";
const SearchStack = createNativeStackNavigator();

export default function SearchStackNavigator() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen}
      options={{
            headerShown: false
        }}
      />
    <SearchStack.Screen name="Show" component={ShowScreen}
    options={{
            headerShown: false
        }}
    />
    </SearchStack.Navigator>
  );
}
