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
import { fetchMyReviews,deleteMyReview } from "../firebase/services/firestoreService";
export default function MyReviewsScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const data = await fetchMyReviews();
    setReviews(data);
    setLoading(false);
  }
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      // Navigate to the show when clicked
      onPress={() => navigation.navigate("Show", { showId: item.showId })}
      // Long press to delete
      onLongPress={() => deleteMyReview(item.id, item.showName)}
      delayLongPress={500}
    >
      {/* Left: Poster */}
      <View style={styles.posterContainer}>
        {item.showPoster ? (
          <Image source={{ uri: item.showPoster }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.placeholder]}>
            <Ionicons name="tv-outline" size={24} color="#475569" />
          </View>
        )}
      </View>

      {/* Right: Review Content */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
            <Text style={styles.showName} numberOfLines={1}>{item.showName}</Text>
            {item.rating > 0 && (
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
            )}
        </View>

        <Text style={styles.reviewText} numberOfLines={3} ellipsizeMode="tail">
            {item.reviewText || "No written review."}
        </Text>

        <View style={styles.footerRow}>
             <Text style={styles.dateText}>
                {item.updatedAt?.seconds 
                  ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() 
                  : "Just now"}
             </Text>
             {item.isFavorite && (
                 <Ionicons name="heart" size={14} color="#ef4444" style={{marginLeft: 8}} />
             )}
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
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList
            data={reviews}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbox-outline" size={64} color="#1e293b" />
                    <Text style={styles.emptyText}>You haven't written any reviews yet.</Text>
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
  listContent: {
      padding: 16,
      paddingBottom: 40
  },
  
  /* --- CARD STYLES (FIXED) --- */
  card: {
      flexDirection: 'row',
      backgroundColor: '#0f172a',
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden', // Keeps image corners rounded
      borderWidth: 1,
      borderColor: '#1e293b',
      maxHeight: 120, // Enforce a minimum height so cards don't look crushed
  },
  posterContainer: {
      width: 90,
      backgroundColor: '#1e293b',
      position: 'relative' // Needed if you want to add badges later
  },
  poster: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover'
  },
  placeholder: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 120 // Fallback height if no image
  },
  contentContainer: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between' // Pushes date to bottom
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Aligns top of text with badges
      marginBottom: 6,
      gap: 8
  },
  showName: {
      color: '#f8fafc',
      fontWeight: 'bold',
      fontSize: 16,
      flex: 1, // Allows title to shrink if needed
      lineHeight: 20
  },
  ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 215, 0, 0.1)', // Gold tint
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4
  },
  ratingText: {
      color: '#FFD700',
      fontWeight: 'bold',
      fontSize: 12
  },
  reviewText: {
      color: '#cbd5e1', // Light gray for better reading
      fontSize: 14,
      lineHeight: 20,
      flex: 1, // Allows text to fill space but respects numberOfLines
      marginBottom: 10
  },
  footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', // Date left, Heart right
      marginTop: 'auto' // Forces this row to the bottom of the card
  },
  dateText: {
      color: '#64748b',
      fontSize: 12,
      fontWeight: '500'
  },

  /* --- EMPTY STATE --- */
  emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
      opacity: 0.6
  },
  emptyText: {
      marginTop: 16,
      color: '#94a3b8',
      fontSize: 16,
      fontWeight: '500'
  }
});