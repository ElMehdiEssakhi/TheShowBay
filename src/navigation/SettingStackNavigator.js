import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import HelpCenterScreen from "../screens/HelpCenterScreen";
import ReportBugScreen from "../screens/ReportBugScreen";
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
            <SettingStack.Screen name="ChangePassword" component={ChangePasswordScreen}
                options={{
                    headerShown: false
                }}
            />
            <SettingStack.Screen name="HelpCenter" component={HelpCenterScreen}
                options={{
                    headerShown: false
                }}
            />
            <SettingStack.Screen name="ReportBug" component={ReportBugScreen}
                options={{
                    headerShown: false
                }}
            />
        </SettingStack.Navigator>
    );
}   