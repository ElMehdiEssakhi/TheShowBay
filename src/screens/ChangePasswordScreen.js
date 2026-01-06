import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";
import { auth } from "../firebase/config";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Toggles for visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleChangePassword = async () => {
    // 1. Basic Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const user = auth.currentUser;

    try {
      // 2. Re-authenticate User
      // This is required by Firebase for sensitive actions
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 3. Update Password
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "Current password is incorrect.");
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Error", "Please log out and log back in before changing password.");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.description}>
            Your new password must be different from previously used passwords.
          </Text>

          {/* Current Password */}
          <PasswordInput 
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            showPassword={showCurrent}
            toggleShow={() => setShowCurrent(!showCurrent)}
          />

          <View style={styles.divider} />

          {/* New Password */}
          <PasswordInput 
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            showPassword={showNew}
            toggleShow={() => setShowNew(!showNew)}
          />

          {/* Confirm Password */}
          <PasswordInput 
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            // Logic: we assume user wants to see both new fields toggled together, 
            // or you can add a 3rd toggle state. Reusing showNew is usually fine UX.
            showPassword={showNew} 
            toggleShow={() => setShowNew(!showNew)}
          />

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text style={styles.saveBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Sub-component for cleaner inputs
function PasswordInput({ label, value, onChangeText, showPassword, toggleShow }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholderTextColor="#475569"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#64748b" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  content: {
    padding: 20,
    marginTop: 10
  },
  description: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 24
  },
  
  /* Input Styles */
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    height: "100%",
  },
  eyeBtn: {
    padding: 8,
  },

  /* Button Styles */
  saveBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  }
});