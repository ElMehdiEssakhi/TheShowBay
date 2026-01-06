import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../firebase/config"; 
// Make sure these match the names in your service file
import { 
  getPlaylists,      // Used the name from your last message
  makePlaylist, 
  deletePlaylist 
} from "../firebase/services/firestoreService"; 

export default function MyListsScreen({ navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    if (!user) return;
    try {
      const data = await getPlaylists(user.uid); // Pass userId if your function expects it
      setPlaylists(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    
    setCreating(true);
    try {
      await makePlaylist(newListName);
      setNewListName("");
      setModalVisible(false);
      loadPlaylists(); // Refresh list
    } catch (error) {
      Alert.alert("Error", "Could not create playlist");
      console.error("Create playlist error:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (playlistId, playlistName) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlistName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlaylist(playlistId);
              // Optimistic update
              setPlaylists(prev => prev.filter(p => p.id !== playlistId));
            } catch (err) {
              Alert.alert("Error", "Could not delete playlist.");
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPlaylists();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate("ListShows", { 
            playlistId: item.id, 
            playlistName: item.name 
        })}
      onLongPress={() => handleDelete(item.id, item.name)}
      delayLongPress={500}
    >
      {/* Cover Image or Placeholder */}
      <View style={styles.imageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.placeholder]}>
            <Ionicons name="albums" size={32} color="#475569" />
          </View>
        )}
        {/* Gradient Overlay for Text Readability */}
        <LinearGradient 
          colors={['transparent', 'rgba(2, 6, 23, 0.9)']} 
          style={styles.gradient} 
        />
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardCount}>{item.itemCount || 0} Shows</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Lists</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList
            data={playlists}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="library-outline" size={64} color="#1e293b" />
                    <Text style={styles.emptyText}>You haven't created any lists yet.</Text>
                </View>
            }
        />
      )}

      {/* FAB - Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#020617" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>New Playlist</Text>
                <Text style={styles.modalSubtitle}>Give your list a name</Text>
                
                <TextInput 
                    style={styles.input}
                    placeholder="e.g. Best Sci-Fi Shows"
                    placeholderTextColor="#64748b"
                    value={newListName}
                    onChangeText={setNewListName}
                    autoFocus
                />

                <View style={styles.modalActions}>
                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.createBtn} 
                        onPress={handleCreate}
                        disabled={creating}
                    >
                        {creating ? (
                            <ActivityIndicator color="#020617" />
                        ) : (
                            <Text style={styles.createText}>Create</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
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
      fontSize: 20,
      fontWeight: 'bold',
      color: '#f8fafc'
  },
  listContent: {
      padding: 16,
      paddingBottom: 80 // Space for FAB
  },
  /* Card Styles */
  card: {
      height: 160,
      marginBottom: 16,
      borderRadius: 16,
      backgroundColor: '#0f172a',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#1e293b'
  },
  imageContainer: {
      width: '100%',
      height: '100%',
  },
  coverImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover'
  },
  placeholder: {
      backgroundColor: '#1e293b',
      justifyContent: 'center',
      alignItems: 'center'
  },
  gradient: {
      position: 'absolute',
      left: 0, 
      right: 0,
      bottom: 0,
      height: '60%'
  },
  cardContent: {
      position: 'absolute',
      bottom: 12,
      left: 16,
      right: 16
  },
  cardTitle: {
      color: '#f8fafc',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 4
  },
  cardCount: {
      color: '#94a3b8',
      fontSize: 12,
      fontWeight: '600'
  },
  
  /* FAB */
  fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#22c55e',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#22c55e',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 4
  },

  /* Empty State */
  emptyContainer: {
      alignItems: 'center',
      marginTop: 60,
      opacity: 0.5
  },
  emptyText: {
      marginTop: 16,
      color: '#94a3b8',
      fontSize: 16
  },

  /* Modal */
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      padding: 24
  },
  modalContent: {
      backgroundColor: '#1e293b',
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: '#334155'
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#f8fafc',
      marginBottom: 8
  },
  modalSubtitle: {
      color: '#94a3b8',
      marginBottom: 20
  },
  input: {
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#334155',
      fontSize: 16,
      marginBottom: 24
  },
  modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12
  },
  cancelBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
  },
  cancelText: {
      color: '#94a3b8',
      fontWeight: '600'
  },
  createBtn: {
      backgroundColor: '#22c55e',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center'
  },
  createText: {
      color: '#020617',
      fontWeight: 'bold'
  }
});