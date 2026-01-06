import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Replace with your actual support email
const SUPPORT_EMAIL = "elmehdiessakhi17@gmail.com";

export default function HelpCenterScreen({ navigation }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // FAQ Accordion State
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing Info", "Please fill in both subject and message.");
      return;
    }

    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        // Clear form after opening mail app
        setSubject("");
        setMessage("");
      } else {
        Alert.alert("Error", "No email client found on this device.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not open email app.");
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
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SECTION 1: FAQ */}
        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
            <FaqItem 
                id={1} 
                question="How do I create a playlist?" 
                answer="Go to a show's detail page, click the 'List' icon, and tap 'Create New Playlist'."
                expandedId={expandedId}
                onToggle={toggleExpand}
            />
            <View style={styles.divider} />
            <FaqItem 
                id={2} 
                question="Is this app free?" 
                answer="Yes! TheShowBay is completely free to use for tracking your favorite shows."
                expandedId={expandedId}
                onToggle={toggleExpand}
            />
            <View style={styles.divider} />
            <FaqItem 
                id={3} 
                question="Can I watch shows here?" 
                answer="No, this is a tracking app. We provide details and metadata, but we do not host streaming content."
                expandedId={expandedId}
                onToggle={toggleExpand}
            />
        </View>

        {/* SECTION 2: CONTACT FORM */}
        <Text style={styles.sectionHeader}>Contact Support</Text>
        <View style={styles.formContainer}>
            <Text style={styles.subText}>
                Found a bug or have a suggestion? Send us a message directly.
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="e.g. Bug in search..."
                    placeholderTextColor="#64748b"
                    value={subject}
                    onChangeText={setSubject}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your issue..."
                    placeholderTextColor="#64748b"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSendEmail}>
                <Ionicons name="mail-outline" size={20} color="#020617" style={{marginRight: 8}} />
                <Text style={styles.sendBtnText}>Send Message</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for FAQ Items
function FaqItem({ id, question, answer, expandedId, onToggle }) {
    const isExpanded = expandedId === id;
    return (
        <View style={styles.faqItem}>
            <TouchableOpacity 
                style={styles.faqHeader} 
                onPress={() => onToggle(id)}
                activeOpacity={0.7}
            >
                <Text style={styles.questionText}>{question}</Text>
                <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#94a3b8" 
                />
            </TouchableOpacity>
            {isExpanded && (
                <View style={styles.faqBody}>
                    <Text style={styles.answerText}>{answer}</Text>
                </View>
            )}
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
    paddingBottom: 40
  },
  sectionHeader: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 10
  },
  
  /* FAQ Styles */
  faqContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 32,
    overflow: "hidden"
  },
  faqItem: {
      backgroundColor: "#0f172a"
  },
  faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16
  },
  questionText: {
      color: "#e2e8f0",
      fontSize: 15,
      fontWeight: "500"
  },
  faqBody: {
      paddingHorizontal: 16,
      paddingBottom: 16
  },
  answerText: {
      color: "#94a3b8",
      lineHeight: 20,
      fontSize: 14
  },
  divider: {
      height: 1,
      backgroundColor: "#1e293b"
  },

  /* Contact Form Styles */
  formContainer: {
      backgroundColor: "#0f172a",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#1e293b",
      padding: 20
  },
  subText: {
      color: "#94a3b8",
      fontSize: 14,
      marginBottom: 20,
      lineHeight: 20
  },
  inputGroup: {
      marginBottom: 16
  },
  label: {
      color: "#cbd5e1",
      marginBottom: 8,
      fontSize: 13,
      fontWeight: "600"
  },
  input: {
      backgroundColor: "#1e293b",
      color: "#f8fafc",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#334155",
      fontSize: 16
  },
  textArea: {
      height: 120
  },
  sendBtn: {
      backgroundColor: "#22c55e",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
      marginTop: 8
  },
  sendBtnText: {
      color: "#020617",
      fontSize: 16,
      fontWeight: "bold"
  }
});