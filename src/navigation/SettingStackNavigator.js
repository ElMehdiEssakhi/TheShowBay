import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
const SettingStack = createNativeStackNavigator();

export default function SettingStackNavigator() {
    return (
        <SettingStack.Navigator>
            <SettingStack.Screen name="Settings" component={SettingsScreen}
                options={{
                    headerShown: false
                }}
            />
            <SettingStack.Screen name="EditProfile" component={EditProfileScreen}
                options={{
                    headerShown: false
                }}
            />
        </SettingStack.Navigator>
    );
}   