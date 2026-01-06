import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Linking // <--- Added this import
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Change this to your actual email
const SUPPORT_EMAIL = "elmehdiessakhi17@gmail.com"; 

export default function ReportBugScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-detect device info
  const getDeviceInfo = () => {
    return `${Platform.OS.toUpperCase()} ${Platform.Version} | ${Platform.isPad ? 'Tablet' : 'Mobile'}`;
  };

  const handleSendEmail = async () => {
    // 1. Validate using the correct state variables (title, description)
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Info", "Please fill in both the title and description.");
      return;
    }

    setLoading(true);

    // 2. Construct the Email Body (Include Device Info)
    const emailSubject = `BUG REPORT: ${title}`;
    const emailBody = `${description}\n\n----------------\nDevice Info: ${getDeviceInfo()}`;

    // 3. Create the Mailto URL
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        
        // Clear form after opening mail app
        setTitle("");
        setDescription("");
      } else {
        Alert.alert("Error", "No email client found on this device.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not open email app.");
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
        <Text style={styles.headerTitle}>Report a Bug</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.infoBox}>
            <Ionicons name="bug-outline" size={24} color="#ef4444" />
            <Text style={styles.infoText}>
              Found something broken? Let us know what happened so we can fix it.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bug Title</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="e.g. App crashes when clicking Search"
                    placeholderTextColor="#64748b"
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description & Steps to Reproduce</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]}
                    placeholder="1. Go to Home screen&#10;2. Click Search&#10;3. App freezes..."
                    placeholderTextColor="#64748b"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            {/* Read-only Device Info */}
            <View style={styles.deviceInfoContainer}>
                <Text style={styles.deviceLabel}>Device Info included:</Text>
                <Text style={styles.deviceValue}>{getDeviceInfo()}</Text>
            </View>

            <TouchableOpacity 
                style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
                onPress={handleSendEmail}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#020617" />
                ) : (
                    <Text style={styles.submitBtnText}>Submit Report via Email</Text>
                )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  infoText: {
    color: '#fca5a5',
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  form: {
    gap: 20
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16
  },
  textArea: {
    height: 150
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  deviceLabel: {
    color: '#64748b',
    fontSize: 12,
    marginRight: 8
  },
  deviceValue: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  submitBtn: {
    backgroundColor: '#ef4444', 
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});