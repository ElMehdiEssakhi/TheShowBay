import React, { useEffect, useState, useMemo } from "react";
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
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function ShowScreen({ route, navigation }) {
  const { showId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    fetchShowData();
  }, []);

  const fetchShowData = async () => {
    try {
      // We use 'embed' to get everything in ONE request
      // embed[]=episodes gets all episodes
      // embed[]=cast gets the actors
      const res = await axios.get(
        `https://api.tvmaze.com/shows/${showId}?embed[]=episodes&embed[]=cast`
      );
      setData(res.data);
    } catch (err) {
      console.log("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Group Episodes by Season ---
  const seasonsData = useMemo(() => {
    if (!data?._embedded?.episodes) return {};
    
    // Group episodes: { "1": [ep1, ep2], "2": [ep1] }
    const grouped = data._embedded.episodes.reduce((acc, ep) => {
      const s = ep.season;
      if (!acc[s]) acc[s] = [];
      acc[s].push(ep);
      return acc;
    }, {});

    return grouped;
  }, [data]);

  const availableSeasons = Object.keys(seasonsData).map(Number).sort((a, b) => a - b);
  const currentEpisodes = seasonsData[selectedSeason] || [];

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#22c55e" />
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
          {/* Gradient for text readability */}
          <LinearGradient
            colors={["transparent", "#020617"]}
            style={styles.gradient}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* --- MAIN INFO --- */}
        <View style={styles.content}>
          <Text style={styles.title}>{data.name}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {data.premiered?.slice(0, 4)}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.metaText, { color: data.status === "Ended" ? "#ef4444" : "#22c55e" }]}>
              {data.status}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{data.averageRuntime} min</Text>
          </View>

          {/* User Actions (Letterboxd Style) */}
          <View style={styles.actionRow}>
            <ActionButton icon="star-outline" label="Rate" />
            <ActionButton icon="eye-outline" label="Log" />
            <ActionButton icon="list-outline" label="List" />
            <ActionButton icon="share-social-outline" label="Share" />
          </View>

          {/* Genres */}
          <View style={styles.genres}>
            {data.genres.map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>

          {/* Rating Block */}
          <View style={styles.ratingBlock}>
             <View style={styles.scoreBox}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.scoreText}>{data.rating?.average || "N/A"}</Text>
             </View>
             <Text style={styles.scoreLabel}>TvMaze Score</Text>
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.summary}>
            {data.summary?.replace(/<[^>]+>/g, "")}
          </Text>

          {/* --- CAST SECTION --- */}
          <Text style={styles.sectionTitle}>Top Cast</Text>
          <FlatList
            horizontal
            data={data._embedded?.cast?.slice(0, 10) || []}
            keyExtractor={(item) => item.person.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.castCard}>
                <Image 
                  source={{ uri: item.person.image?.medium }} 
                  style={styles.castImage} 
                />
                <Text numberOfLines={1} style={styles.castName}>{item.person.name}</Text>
                <Text numberOfLines={1} style={styles.charName}>{item.character.name}</Text>
              </View>
            )}
          />

          {/* --- SEASONS & EPISODES --- */}
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

          {/* Episode List for Selected Season */}
          <View style={styles.episodeList}>
            {currentEpisodes.map((ep) => (
              <View key={ep.id} style={styles.episodeRow}>
                <Image 
                  source={{ uri: ep.image?.medium }} 
                  style={styles.epImage} 
                />
                <View style={styles.epInfo}>
                  <Text style={styles.epTitle}>
                    {ep.number}. {ep.name}
                  </Text>
                  <View style={styles.epMeta}>
                    <Text style={styles.epDate}>{ep.airdate}</Text>
                    {ep.rating?.average && (
                      <View style={styles.epRating}>
                        <Ionicons name="star" size={10} color="#fbbf24" />
                        <Text style={styles.epRatingText}>{ep.rating.average}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity>
                   <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// Helper Component for Buttons
function ActionButton({ icon, label }) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Ionicons name={icon} size={24} color="#94a3b8" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  loader: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  posterContainer: {
    width: width,
    height: 450,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 250, // Fade height
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -80, // Pull up over the gradient
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
    color: "#94a3b8",
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
  /* Cast Styles */
  castCard: {
    width: 100,
    marginRight: 12,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circle
    marginBottom: 8,
    backgroundColor: '#1e293b'
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
  /* Episodes Styles */
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
  }
});