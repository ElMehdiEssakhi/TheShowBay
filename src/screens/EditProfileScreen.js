import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { updateUserProfile, getUserProfile } from "../firebase/services/firestoreService";

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Load Firestore Data on Mount
  useEffect(() => {
    const loadData = async () => {
    const profileData = await getUserProfile();
    if(profileData.displayName) setName(profileData.displayName);
    if(profileData.bio) setBio(profileData.bio);
    setInitialLoading(false);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
        Alert.alert("Error", "Display Name cannot be empty.");
        return;
    }
    setLoading(true);
    try {
        await updateUserProfile({
            displayName: name,
            bio: bio,
        });
        
        Alert.alert("Success", "Profile updated successfully!", [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);
    } catch (error) {
        Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (initialLoading) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.iconBtn}>
          {loading ? (
              <ActivityIndicator size="small" color="#22c55e" />
          ) : (
              <Ionicons name="checkmark" size={24} color="#22c55e" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                         <Ionicons name="person" size={40} color="#64748b" />
                    </View>
                <TouchableOpacity style={styles.cameraBtn} onPress={() => Alert.alert("Upload", "Image upload feature coming soon!")}>
                    <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
            
            <InputGroup label="Display Name" value={name} onChangeText={setName} icon="person-outline" />
            
            <InputGroup label="Bio" value={bio} onChangeText={setBio} icon="information-circle-outline" multiline />
            
            {/* <InputGroup label="Location" value={location} onChangeText={setLocation} icon="location-outline" /> */}
            
            {/* <InputGroup label="Phone" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" /> */}
            

        </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper Component for Inputs
function InputGroup({ label, value, onChangeText, icon, multiline = false, keyboardType = "default" }) {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, multiline && styles.multilineWrapper]}>
                <Ionicons 
                    name={icon} 
                    size={20} 
                    color="#94a3b8" 
                    style={[styles.inputIcon, multiline && { marginTop: 12 }]} 
                />
                <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor="#475569"
                    multiline={multiline}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  loadingContainer: {
      flex: 1,
      backgroundColor: "#020617",
      justifyContent: 'center',
      alignItems: 'center'
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
  iconBtn: {
      padding: 4,
  },
  content: {
      paddingBottom: 40
  },
  
  /* Avatar */
  avatarSection: {
      alignItems: 'center',
      paddingVertical: 24,
  },
  avatarContainer: {
      position: 'relative',
  },
  avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#1e293b',
      borderWidth: 2,
      borderColor: '#334155'
  },
  avatarPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center'
  },
  cameraBtn: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#22c55e',
      padding: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#020617'
  },
  changePhotoText: {
      color: '#22c55e',
      marginTop: 12,
      fontWeight: '600',
      fontSize: 14
  },

  /* Form */
  form: {
      paddingHorizontal: 20,
  },
  inputContainer: {
      marginBottom: 20,
  },
  label: {
      color: '#94a3b8',
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
      marginLeft: 4,
      textTransform: 'uppercase'
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0f172a',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#334155',
      paddingHorizontal: 12,
  },
  multilineWrapper: {
      alignItems: 'flex-start',
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
      flex: 1,
      color: '#f8fafc',
      paddingVertical: 12,
      fontSize: 16,
      minHeight: 48,
  },
  multilineInput: {
      height: 100,
      textAlignVertical: 'top',
  },
  helperText: {
      color: '#475569',
      fontSize: 12,
      marginTop: 6,
      marginLeft: 4
  }
});