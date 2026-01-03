import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// --- NEW IMPORT ---
import { useFocusEffect } from "@react-navigation/native";

// Firebase & Services
import { auth } from "../firebase/config";
// Import the new fetch function instead of subscribe
import {fetchWatchlist } from "../firebase/services/firestoreService";

const { width } = Dimensions.get("window");
const SPACING = 12;
const POSTER_WIDTH = (width - (SPACING * 4)) / 3;


export default function WatchlistScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);
  // Initial loading state (for first render)
  const [loading, setLoading] = useState(true);
  // Refreshing state (for pull-to-refresh gesture)
  const [refreshing, setRefreshing] = useState(false);
  
  const user = auth.currentUser;

  // --- THE DATA LOADING LOGIC ---
  // We wrap this in useCallback so it can be reused by useFocusEffect and onRefresh
  const loadData = useCallback(async (isPullToRefresh = false) => {
      // Only show big spinner on initial load, not on pull-to-refresh
      if (!isPullToRefresh) setLoading(true);

      try {
          const data = await fetchWatchlist();
          setWatchlist(data);
      } catch (err) {
          console.error("Failed to load watchlist data", err);
          // Optional: Alert.alert("Error", "Could not load watchlist");
      } finally {
          setLoading(false);
          setRefreshing(false);
      }
  }, [user]);


  // --- FOCUS EFFECT (Replaces useEffect) ---
  // This runs every time the screen comes into focus (e.g., tapping the tab)
  useFocusEffect(
    useCallback(() => {
      loadData(); 
      // No return cleanup function needed for a one-time fetch
    }, [loadData])
  );


  // --- PULL TO REFRESH HANDLER ---
  const handleRefresh = () => {
      setRefreshing(true);
      loadData(true); // Pass true to indicate it's a refresh
  };


  // --- RENDERERS (Mostly Unchanged) ---

  const renderShowCard = ({ item }) => {
    if (!item.poster) return null;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Show", { showId: item.id })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.poster }}
          style={styles.poster}
          resizeMode="cover"
        />
        <LinearGradient
            colors={["transparent", "rgba(2, 6, 23, 0.8)"]}
            style={styles.cardGradient}
        />
        <Text numberOfLines={1} style={styles.showTitle}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
      if (loading) return null;
      return (
        <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptySubtitle}>
                Shows you add to your watchlist will appear here.
            </Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.exploreBtnText}>Find Shows</Text>
            </TouchableOpacity>
        </View>
      );
  };

  if (!user) {
      return (
        <SafeAreaView style={[styles.container, styles.centerContainer]}>
             <Ionicons name="person-circle-outline" size={64} color="#334155" />
             <Text style={styles.emptyTitle}>Please Log In</Text>
             <Text style={styles.emptySubtitle}>You need an account to save a watchlist.</Text>
             <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.exploreBtnText}>Go to Login</Text>
            </TouchableOpacity>
        </SafeAreaView>
      );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Watchlist</Text>
        {!loading && (
            <Text style={styles.countText}>{watchlist.length} Shows</Text>
        )}
      </View>

      {loading ? (
         <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
         </View>
      ) : (
        <FlatList
            data={watchlist}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderShowCard}
            numColumns={3}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={{ gap: SPACING }}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            // --- ADD PULL TO REFRESH ---
            onRefresh={handleRefresh}
            refreshing={refreshing}
            // Set colors for the refresh spinner on Android/iOS
            tintColor="#22c55e" 
            colors={["#22c55e"]} 
        />
      )}
    </SafeAreaView>
  );
}

// ... (Styles remain exactly the same as the previous version) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  headerContainer: {
    paddingHorizontal: SPACING,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e5e7eb",
  },
  countText: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 4
  },
  listContent: {
    paddingHorizontal: SPACING,
    paddingBottom: 20,
    gap: SPACING, // Vertical spacing between rows
  },
  
  /* Card Styles */
  card: {
    width: POSTER_WIDTH,
    height: POSTER_WIDTH * 1.5,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
      position: 'absolute',
      left:0, right:0, bottom:0,
      height: 60,
  },
  showTitle: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 11,
    color: "#e2e8f0",
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 2
  },

  /* Empty State Styles */
  emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
  },
  emptyTitle: {
      color: '#e2e8f0',
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16
  },
  emptySubtitle: {
      color: '#94a3b8',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
      maxWidth: '70%'
  },
  exploreBtn: {
      backgroundColor: '#1e293b',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#334155'
  },
  exploreBtnText: {
      color: '#f8fafc',
      fontWeight: '600'
  }
});