import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase/config";
import { 
  fetchPlaylistItems, 
  removeShowFromPlaylist 
} from "../firebase/services/firestoreService";

export default function SingleListScreen({ route, navigation }) {
  const { playlistId, playlistName } = route.params;
  const user = auth.currentUser;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await fetchPlaylistItems(playlistId);
      setItems(data);
      console.log("Fetched playlist items:", data, playlistId);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load playlist items.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (showId, showName) => {
    Alert.alert(
      "Remove Show",
      `Remove "${showName}" from this list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Remove from Firestore
              await removeShowFromPlaylist(playlistId, showId);
              // 2. Remove from Local State (Optimistic Update)
              setItems((prev) => prev.filter((item) => item.id !== showId));
            } catch (error) {
              Alert.alert("Error", "Failed to remove show.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    // Handle cases where image object might be missing or different format

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Show", { showId: item.id })}
      >
        {/* Poster Image */}
        {item.poster ? (
          <Image source={{ uri: item.poster }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.placeholder]}>
            <Ionicons name="image-outline" size={24} color="#475569" />
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.subtitle}>
             {/* You could add extra info here if you stored it, e.g. Year */}
             TV Show
          </Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleRemove(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlistName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="film-outline" size={64} color="#1e293b" />
              <Text style={styles.emptyText}>This playlist is empty.</Text>
              <Text style={styles.emptySubText}>
                Go to a show's page to add it here.
              </Text>
            </View>
          }
        />
      )}
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
    justifyContent: "center",
    alignItems: "center",
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
    flex: 1,
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  
  /* Item Card */
  card: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  poster: {
    width: 60,
    height: 90,
    resizeMode: "cover",
    backgroundColor: "#1e293b",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 12,
  },
  deleteBtn: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Empty State */
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 16,
    color: "#94a3b8",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubText: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
  },
});