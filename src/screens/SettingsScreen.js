import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config"; 

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
        >
             <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        {/* Placeholder for balance */}
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SECTION: ACCOUNT */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.sectionContainer}>
            <SettingItem 
                icon="person-outline" 
                label="Edit Profile" 
                onPress={() =>navigation.navigate("EditProfile")} 
            />
            <View style={styles.divider} />
            <SettingItem 
                icon="lock-closed-outline" 
                label="Change Password" 
                onPress={() => navigation.navigate("ChangePassword")} 
            />
            {/* <View style={styles.divider} />
            <SettingItem 
                icon="shield-checkmark-outline" 
                label="Privacy & Security" 
                onPress={() => Alert.alert("Coming Soon")} 
            /> */}
        </View>

        {/* SECTION: PREFERENCES */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.sectionContainer}>
            {/* <SettingSwitch 
                icon="notifications-outline" 
                label="Push Notifications" 
                value={notifications}
                onValueChange={setNotifications}
            /> */}
            {/* <View style={styles.divider} />
            <SettingSwitch 
                icon="cellular-outline" 
                label="Data Saver (Low Quality Images)" 
                value={dataSaver}
                onValueChange={setDataSaver}
            /> */}
            {/* <View style={styles.divider} /> */}
            <SettingItem 
                icon="moon-outline" 
                label="Theme" 
                valueText="Dark"
                onPress={() => Alert.alert("Theme locked to Dark Mode")} 
            />
        </View>

        {/* SECTION: SUPPORT */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.sectionContainer}>
            <SettingItem 
                icon="help-circle-outline" 
                label="Help Center" 
                onPress={() => navigation.navigate("HelpCenter")} 
            />
            <View style={styles.divider} />
            <SettingItem 
                icon="bug-outline" 
                label="Report a Bug" 
                onPress={() => navigation.navigate("ReportBug")} 
            />
        </View>

        {/* SECTION: DANGER ZONE */}
        <View style={[styles.sectionContainer, { marginTop: 24, borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
             <TouchableOpacity style={styles.row} onPress={handleLogout}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                </View>
                <Text style={[styles.rowLabel, { color: "#ef4444" }]}>Sign Out</Text>
            </TouchableOpacity>
        </View>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

function SettingItem({ icon, label, onPress, valueText }) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color="#94a3b8" />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
            {valueText && <Text style={styles.valueText}>{valueText}</Text>}
            <Ionicons name="chevron-forward" size={16} color="#475569" />
        </TouchableOpacity>
    );
}

function SettingSwitch({ icon, label, value, onValueChange }) {
    return (
        <View style={styles.row}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color="#94a3b8" />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
            <Switch
                trackColor={{ false: "#334155", true: "#22c55e" }}
                thumbColor={value ? "#fff" : "#f4f3f4"}
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#f8fafc'
  },
  backBtn: {
      padding: 4
  },
  content: {
      padding: 16,
      paddingBottom: 40
  },
  sectionHeader: {
      color: '#64748b',
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 24,
      marginLeft: 4
  },
  sectionContainer: {
      backgroundColor: '#1e293b',
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#334155'
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
  },
  divider: {
      height: 1,
      backgroundColor: '#334155',
      marginLeft: 56 // Align with text, skipping icon
  },
  iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: '#0f172a',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
  },
  rowLabel: {
      flex: 1,
      fontSize: 15,
      color: '#e2e8f0',
      fontWeight: '500'
  },
  valueText: {
      fontSize: 14,
      color: '#94a3b8',
      marginRight: 8
  },
  versionText: {
      textAlign: 'center',
      color: '#475569',
      fontSize: 12,
      marginTop: 32
  }
});