import { signOut } from "firebase/auth";
import { Button, Text, View } from "react-native";
import { auth } from "../firebase/config";

export default function HomeScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome 🎉</Text>
      <Button title="Logout" onPress={() => signOut(auth)} />
    </View>
  );
}
