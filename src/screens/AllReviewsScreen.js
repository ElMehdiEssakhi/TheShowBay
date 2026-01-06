import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchReviewsForShow } from "../firebase/services/firestoreService";

export default function AllReviewsScreen({ route, navigation }) {
  const { showId, showName } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const data = await fetchReviewsForShow(showId);
    // Filter out empty reviews if you want
    const textReviews = data.filter(r => r.reviewText && r.reviewText.trim().length > 0);
    setReviews(textReviews);
    setLoading(false);
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
                {item.authorPhoto ? (
                    <Image source={{ uri: item.authorPhoto }} style={styles.reviewerAvatar} />
                ) : (
                    <View style={[styles.reviewerAvatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={12} color="#94a3b8" />
                    </View>
                )}
                <Text style={styles.reviewerName}>{item.authorName}</Text>
            </View>
            
            {item.rating > 0 && (
                <View style={styles.reviewRating}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.reviewRatingText}>{item.rating}/5</Text>
                </View>
            )}
        </View>
        <Text style={styles.reviewText}>{item.reviewText}</Text>
        {item.updatedAt && (
            <Text style={styles.reviewDate}>
            {new Date(item.updatedAt.seconds * 1000).toLocaleDateString()}
            </Text>
        )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Reviews: {showName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList 
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={renderReview}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No reviews found.</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#f8fafc", flex: 1, textAlign: 'center' },
  listContent: { padding: 16 },
  
  // Reusing your Review Card Styles
  reviewCard: {
      backgroundColor: '#0f172a',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#1e293b'
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewerAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1e293b' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  reviewerName: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255, 215, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  reviewRatingText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  reviewText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  reviewDate: { color: '#64748b', fontSize: 10, marginTop: 8, textAlign: 'right' },
  emptyText: { color: '#94a3b8' }
});