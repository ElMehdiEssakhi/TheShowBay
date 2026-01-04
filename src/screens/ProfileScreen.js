import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config"; // Make sure path is correct

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
    }
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              // App.js listener will handle redirection to Login
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* --- HEADER / USER INFO --- */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#94a3b8" />
        </View>
        <View>
          <Text style={styles.username}>
            {user?.email?.split('@')[0] || "User"}
          </Text>
          <Text style={styles.email}>{user?.email || "No email"}</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="#e2e8f0" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- STATS ROW --- */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Shows</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Episodes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>

        {/* --- MENU OPTIONS --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <MenuOption icon="heart-outline" label="Favorites" onPress={() => navigation?.navigate("Favorites")} />
          <MenuOption icon="list-outline" label="My Lists" onPress={() => alert("My Lists Coming Soon!")} />
          <MenuOption icon="time-outline" label="WatchList" onPress={() => navigation?.navigate("Watchlist")} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <MenuOption icon="notifications-outline" label="Notifications" onPress={() => alert("Notifications Coming Soon!")} />
          <MenuOption icon="help-circle-outline" label="Help & Support" onPress={() => alert("Help & Support Coming Soon!")} />
          
          {/* Logout Button */}
          <TouchableOpacity style={styles.menuOption} onPress={handleLogout}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.menuText, { color: "#ef4444" }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={16} color="#334155" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
function MenuOption({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="#e2e8f0" />
      </View>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#334155" />
    </TouchableOpacity>
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
    padding: 20,
    gap: 16,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },
  username: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    color: "#94a3b8",
    fontSize: 14,
  },
  settingsBtn: {
    marginLeft: "auto",
    padding: 8,
    backgroundColor: "#1e293b",
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 100, 
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#22c55e",
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#334155",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "500",
  },
  
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderTopColor: "#0f172a",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 5,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  navLabel: {
    fontSize: 11,
  },
});