import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
  Modal,           
  TextInput,       
  KeyboardAvoidingView,
  Platform
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Assuming you have created a service file for Firestore operations
import { 
    addToWatchlist, 
    removeFromWatchlist, 
    getShowStatus,
    saveShowReview
} from "../firebase/services/firestoreService"; 
// ---------------------------

const { width } = Dimensions.get("window");

export default function ShowScreen({ route, navigation }) {
  const { showId } = route.params;
  const insets = useSafeAreaInsets();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  // --- NEW: WATCHLIST STATE ---
  const [inWatchlist, setInWatchlist] = useState(false);
  // Used to show a loading indicator specifically on the button if needed, 
  // or prevent double presses.
  const [watchlistProcessing, setWatchlistProcessing] = useState(false); 
  // ---------------------------

  // --- REVIEW MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);      // 1-5
  const [isFavorite, setIsFavorite] = useState(false);  // Heart toggle
  const [reviewText, setReviewText] = useState("");     // Text input
  const [savingReview, setSavingReview] = useState(false);


  useEffect(() => {
    fetchShowData();
    // --- NEW: Check status on load ---
    checkUserStatus();
  }, [showId]);


  // --- NEW: FIREBASE LOGIC ---

  // 1. Check if already in watchlist on load
  const checkUserStatus = async () => {
      try {
          const status = await getShowStatus(showId);
          setInWatchlist(status.inWatchlist);
          setUserRating(status.userRating);
          setIsFavorite(status.isFavorite);
          setReviewText(status.reviewText);
      } catch (err) {
          console.log("Error checking watchlist status:", err);
      }
  };

  // 2. Handle toggling the button
  const handleWatchlistToggle = async () => {
      if (watchlistProcessing) return; // Prevent double press
      setWatchlistProcessing(true);

      // OPTIMISTIC UPDATE: Update UI immediately for snappy feel
      const previousState = inWatchlist;
      setInWatchlist(!previousState);

      try {
          if (previousState) {
              // It was in watchlist, so remove it
              await removeFromWatchlist(showId);
          } else {
              // It wasn't in watchlist, so add it
              // We pass required data so the watchlist screen doesn't need to refetch API
              const showDataForFirestore = {
                  id: data.id,
                  name: data.name,
                  poster: data.image?.medium || null ,
              };
              await addToWatchlist(showDataForFirestore);
          }
          // Success - UI is already updated due to optimistic update
      } catch (err) {
          console.error("Watchlist action failed:", err);
          // REVERT UI on failure
          setInWatchlist(previousState);
          Alert.alert("Error", "Could not update watchlist. Please try again.");
      } finally {
          setWatchlistProcessing(false);
      }
  };
  // ---------------------------

  const handleSaveReview = async () => {
      setSavingReview(true);
      
      try {
        const showData = {
            id: data.id,
            name: data.name,
            poster: data.image?.medium || null,
        };
        
        const reviewData = {
            rating: userRating,
            isFavorite: isFavorite,
            reviewText: reviewText
        };

        await saveShowReview(showData, reviewData);
        setModalVisible(false); // Close modal
      } catch (error) {
          Alert.alert("Error", "Failed to save review.");
          console.error("Save review error:", error);
      } finally {
          setSavingReview(false);
      }
  };

  const fetchShowData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://api.tvmaze.com/shows/${showId}?embed[]=episodes&embed[]=cast`
      );
      setData(res.data);
      
      if (res.data._embedded?.episodes?.length > 0) {
         const uniqueSeasons = [...new Set(res.data._embedded.episodes.map(ep => ep.season))];
         uniqueSeasons.sort((a, b) => a - b);
         if (uniqueSeasons.length > 0) {
             setSelectedSeason(uniqueSeasons[0]);
         }
      }

    } catch (err) {
      console.log("Error fetching details:", err);
      setError("Failed to load show details.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS (Memoized) ---
  const seasonsData = useMemo(() => {
    if (!data?._embedded?.episodes) return {};
    return data._embedded.episodes.reduce((acc, ep) => {
      const s = ep.season;
      if (!acc[s]) acc[s] = [];
      acc[s].push(ep);
      return acc;
    }, {});
  }, [data]);

  const availableSeasons = useMemo(() => {
      return Object.keys(seasonsData).map(Number).sort((a, b) => a - b);
  }, [seasonsData]);

  const currentEpisodes = useMemo(() => {
      return selectedSeason ? (seasonsData[selectedSeason] || []) : [];
  }, [seasonsData, selectedSeason]);


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
      return (
          <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchShowData}>
                  <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
          </View>
      );
  }

  if (!data) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- HERO SECTION --- */}
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: data.image?.original || data.image?.medium }}
            style={styles.poster}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "#020617"]}
            style={styles.gradient}
          />
          
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* --- MAIN INFO --- */}
        <View style={styles.content}>
          <Text style={styles.title}>{data.name}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {data.premiered?.slice(0, 4) || "N/A"}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.metaText, { color: data.status === "Ended" ? "#ef4444" : "#22c55e" }]}>
              {data.status}
            </Text>
            {data.averageRuntime ? (
                <>
                 <Text style={styles.dot}>•</Text>
                 <Text style={styles.metaText}>{data.averageRuntime} min</Text>
                </>
            ) : null}
          </View>

          {/* --- ACTION ROW (UPDATED) --- */}
          <View style={styles.actionRow}>
            {/* 1. Rate (Placeholder) */}
            <ActionButton icon={userRating > 0 ? "star" : "star-outline"} 
            label={userRating > 0 ? `${userRating}/5` : "Rate"}
            active={userRating > 0}
            onPress={() =>setModalVisible(true)} />
            
            {/* 2. WATCHLIST TOGGLE (Replaces Log) */}
            <ActionButton 
                // Use filled icon if in watchlist, outline if not
                icon={inWatchlist ? "bookmark" : "bookmark-outline"} 
                label={inWatchlist ? "Added" : "Watchlist"}
                // Pass active state for styling
                active={inWatchlist} 
                onPress={handleWatchlistToggle}
            />

            {/* 3. List (Placeholder) */}
            <ActionButton icon="list-outline" label="List" onPress={() => Alert.alert("Coming Soon")} />
            {/* 4. Share (Placeholder) */}
            <ActionButton icon="share-social-outline" label="Share" onPress={() => Alert.alert("Coming Soon")} />
          </View>

          {/* Genres */}
          <View style={styles.genres}>
            {data.genres?.map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Rating Block */}
          {data.rating?.average && (
            <View style={styles.ratingBlock}>
                <View style={styles.scoreBox}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.scoreText}>{data.rating.average}</Text>
                </View>
                <Text style={styles.scoreLabel}>TvMaze Score</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.summary}>
            {data.summary ? data.summary.replace(/<[^>]+>/g, "") : "No summary available."}
          </Text>

          {/* --- CAST SECTION --- */}
          <Text style={styles.sectionTitle}>Top Cast</Text>
          <FlatList
            horizontal
            data={data._embedded?.cast?.slice(0, 10) || []}
            keyExtractor={(item) => item.person.id.toString() + item.character.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            renderItem={({ item }) => <CastMember item={item} />}
            ListEmptyComponent={<Text style={styles.emptyText}>Cast information unavailable.</Text>}
          />

          {/* --- SEASONS & EPISODES --- */}
          {availableSeasons.length > 0 ? (
            <>
              <View style={styles.seasonHeader}>
                <Text style={styles.sectionTitle}>Episodes</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={{ marginLeft: 10 }}
                >
                  {availableSeasons.map(seasonNum => (
                    <TouchableOpacity 
                      key={seasonNum}
                      style={[
                        styles.seasonTab, 
                        selectedSeason === seasonNum && styles.seasonTabActive
                      ]}
                      onPress={() => setSelectedSeason(seasonNum)}
                    >
                      <Text style={[
                        styles.seasonText,
                        selectedSeason === seasonNum && styles.seasonTextActive
                      ]}>
                        Season {seasonNum}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FlatList 
                  data={currentEpisodes}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({item}) => <EpisodeRow item={item} />}
                  scrollEnabled={false}
                  contentContainerStyle={styles.episodeList}
              />
             </>
          ) : (
             <Text style={[styles.emptyText, {marginTop: 20}]}>No episode information available.</Text>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <View style={styles.modalContent}>
                
                {/* Header */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Rate & Review</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Show Title */}
                <Text style={styles.modalShowName}>{data.name}</Text>

                {/* Star Rating System */}
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                            <Ionicons 
                                name={star <= userRating ? "star" : "star-outline"} 
                                size={36} 
                                color="#FFD700" 
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Favorite Toggle */}
                <TouchableOpacity 
                    style={styles.favoriteToggle} 
                    onPress={() => setIsFavorite(!isFavorite)}
                >
                    <Ionicons 
                        name={isFavorite ? "heart" : "heart-outline"} 
                        size={24} 
                        color={isFavorite ? "#ef4444" : "#94a3b8"} 
                    />
                    <Text style={[styles.favText, isFavorite && {color: "#ef4444"}]}>
                        {isFavorite ? "Added to Favorites" : "Add to Favorites"}
                    </Text>
                </TouchableOpacity>

                {/* Review Text Input */}
                <TextInput
                    style={styles.reviewInput}
                    placeholder="Write your review here..."
                    placeholderTextColor="#64748b"
                    multiline
                    value={reviewText}
                    onChangeText={setReviewText}
                    textAlignVertical="top"
                />

                {/* Save Button */}
                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={handleSaveReview}
                    disabled={savingReview}
                >
                    {savingReview ? (
                        <ActivityIndicator color="#020617" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Review</Text>
                    )}
                </TouchableOpacity>

            </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// --- EXTRACTED SUB-COMPONENTS ---

// 1. Action Button Helper (UPDATED to support 'active' state)
function ActionButton({ icon, label, onPress, active = false }) {
    // Choose color based on active state. 
    // Green (#22c55e) for active watchlist, Gray (#94a3b8) for inactive.
    const color = active ? "#22c55e" : "#94a3b8";
    
    return (
      <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.actionLabel, { color: color }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

// ... (CastMember and EpisodeRow components remain exactly the same as in the previous response) ...
// 2. Cast Member Card
const CastMember = React.memo(({ item }) => (
    <View style={styles.castCard}>
    {item.person.image?.medium ? (
        <Image 
            source={{ uri: item.person.image.medium }} 
            style={styles.castImage} 
        />
    ) : (
        <View style={[styles.castImage, styles.placeholderImage]}>
            <Ionicons name="person" size={40} color="#475569" />
        </View>
    )}
    
    <Text numberOfLines={1} style={styles.castName}>{item.person.name}</Text>
    <Text numberOfLines={1} style={styles.charName}>{item.character.name}</Text>
    </View>
));

// 3. Episode Row
const EpisodeRow = React.memo(({ item: ep }) => (
    <View style={styles.episodeRow}>
      {ep.image?.medium ? (
         <Image source={{ uri: ep.image.medium }} style={styles.epImage} />
      ) : (
         <View style={[styles.epImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={24} color="#475569" />
         </View>
      )}
      
      <View style={styles.epInfo}>
        <Text style={styles.epTitle} numberOfLines={1}>
          {ep.number ? `${ep.number}. ` : ""}{ep.name}
        </Text>
        <View style={styles.epMeta}>
          <Text style={styles.epDate}>{ep.airdate || "No date"}</Text>
          {ep.rating?.average && (
            <View style={styles.epRating}>
              <Ionicons name="star" size={10} color="#fbbf24" />
              <Text style={styles.epRatingText}>{ep.rating.average}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={{padding: 8}}>
          <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
      </TouchableOpacity>
    </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
      color: "#ef4444",
      marginTop: 10,
      marginBottom: 20,
      fontSize: 16,
  },
  retryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#1e293b',
      borderRadius: 8,
  },
  retryText: {
      color: "#f8fafc",
      fontWeight: 'bold'
  },
  posterContainer: {
    width: width,
    height: 450,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
    backgroundColor: '#1e293b'
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -80,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metaText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "600",
  },
  dot: {
    color: "#64748b",
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  actionBtn: {
    alignItems: "center",
    flex: 1,
  },
  actionLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  genreTag: {
    backgroundColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genreText: {
    color: "#e2e8f0",
    fontSize: 12,
  },
  ratingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold"
  },
  scoreLabel: {
    color: "#64748b",
    fontSize: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f1f5f9",
    marginTop: 10,
    marginBottom: 12,
  },
  summary: {
    fontSize: 15,
    lineHeight: 24,
    color: "#cbd5e1",
    marginBottom: 20,
  },
  emptyText: {
      color: "#64748b",
      fontStyle: 'italic',
  },
  castCard: {
    width: 100,
    marginRight: 12,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: '#1e293b',
  },
  placeholderImage: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#334155'
  },
  castName: {
    color: '#e2e8f0',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600'
  },
  charName: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center'
  },
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  seasonTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155'
  },
  seasonTabActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e'
  },
  seasonText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  seasonTextActive: {
    color: '#020617',
    fontWeight: '700'
  },
  episodeList: {
    gap: 16
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    overflow: 'hidden',
    paddingRight: 12
  },
  epImage: {
    width: 100,
    height: 65,
    backgroundColor: '#1e293b'
  },
  epInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 4
  },
  epTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600'
  },
  epMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  epDate: {
    color: '#64748b',
    fontSize: 11
  },
  epRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  },
  epRatingText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Bottom sheet style
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  modalShowName: {
      color: "#94a3b8",
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  favoriteToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      padding: 12,
      borderRadius: 12,
      marginBottom: 24,
      gap: 8
  },
  favText: {
      color: "#94a3b8",
      fontWeight: '600',
      fontSize: 14
  },
  reviewInput: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    height: 120,
    fontSize: 16,
    marginBottom: 24,
    textAlignVertical: "top", // Important for multiline
  },
  saveButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 16,
  },
});