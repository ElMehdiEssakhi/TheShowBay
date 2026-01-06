import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const POSTER_WIDTH = width / 3 - 16;
const BATCH_SIZE = 12;

const GENRES = ["All", "Action", "Drama", "Comedy", "Thriller", "Horror", "Romance", "Sci-Fi", "Crime", "Mystery", "Adventure", "Fantasy"];

export default function HomeScreen({ navigation }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const currentPageRef = useRef(Math.floor(Math.random() * 200)); 

  useEffect(() => {
    setShows([]); 
    loadMoreShows(true); 
  }, [selectedGenre]);

  // --- 2. VALIDATION LOGIC ---
  const isValidShow = (show) => {
    const isScripted = show.type === "Scripted";
    const hasImage = show.image?.medium;
    const isModern = show.premiered && parseInt(show.premiered.substring(0, 4)) >= 2000;
    const isGoodQuality = (show.rating?.average >= 5.0) || (show.weight > 70);
    const isEnglish = show.language === "English";
    const matchesGenre = selectedGenre === "All" || (show.genres && show.genres.includes(selectedGenre));

    return isScripted && hasImage && isModern && isGoodQuality && isEnglish && matchesGenre;
  };

  // --- 3. RECURSIVE FETCHING ---
  const fetchValidBatch = async (startPage, accumulatedShows = []) => {
    try {
      if (accumulatedShows.length >= BATCH_SIZE) {
        return { shows: accumulatedShows, nextPage: startPage };
      }
      if (accumulatedShows.length > 0 && startPage > 300) {
         return { shows: accumulatedShows, nextPage: 0 };
      }

      const response = await axios.get(`https://api.tvmaze.com/shows?page=${startPage}`);
      const validShows = response.data.filter(isValidShow);
      
      const shuffled = validShows.map(value => ({ value, sort: Math.random() }))
                                 .sort((a, b) => a.sort - b.sort)
                                 .map(({ value }) => value);
                                 
      const newAccumulation = [...accumulatedShows, ...shuffled];

      if (newAccumulation.length < BATCH_SIZE) {
        return fetchValidBatch(startPage + 1, newAccumulation);
      }

      return { shows: newAccumulation, nextPage: startPage + 1 };

    } catch (err) {
      if (err.response && err.response.status === 404) {
          return { shows: accumulatedShows, nextPage: 0 }; 
      }
      return { shows: accumulatedShows, nextPage: startPage };
    }
  };

  const loadMoreShows = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    let pageToFetch = isRefresh ? Math.floor(Math.random() * 200) : currentPageRef.current;
    const result = await fetchValidBatch(pageToFetch);
    currentPageRef.current = result.nextPage;
    if (isRefresh) setShows(result.shows);
    else setShows(prev => [...prev, ...result.shows]);
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMoreShows(true);
  };

  const renderShow = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation?.navigate("Show", { showId: item.id })}
      >
        <Image source={{ uri: item.image.medium }} style={styles.poster} resizeMode="cover" />
        {item.rating?.average && (
           <View style={styles.ratingBadge}>
             <Ionicons name="star" size={10} color="#FFD700" />
             <Text style={styles.ratingText}>{item.rating.average}</Text>
           </View>
        )}
      </TouchableOpacity>
    );
  }, [navigation]);

  const renderFooter = () => {
    if (!loading) return null; // No invisible bar when not loading
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#22c55e" />
        <Text style={{color: "#6b7280", fontSize: 10, marginTop: 5}}>
            Finding {selectedGenre === "All" ? "good" : selectedGenre} shows...
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Discover</Text>
        <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
                {GENRES.map((genre) => (
                    <TouchableOpacity 
                        key={genre}
                        style={[
                            styles.filterChip, 
                            selectedGenre === genre && styles.filterChipActive
                        ]}
                        onPress={() => setSelectedGenre(genre)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedGenre === genre && styles.filterTextActive
                        ]}>
                            {genre}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
      </View>

      <FlatList
        data={shows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderShow}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        
        // --- THIS FIXES THE GAP ---
        // 80 is roughly the height of a Tab Bar.
        // This makes the content stop exactly above your navigation tabs.
        contentContainerStyle={styles.listContent}
        
        onEndReached={() => loadMoreShows(false)}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading && (
            <View style={{alignItems: 'center', marginTop: 50}}>
                <Text style={{color: '#6b7280'}}>No shows found for this genre.</Text>
            </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: Platform.OS === "android" ? 25 : 0, 
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 15, 
    backgroundColor: "#020617",
    zIndex: 10
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#e5e7eb",
    marginVertical: 10,
  },
  filterRow: {
      flexDirection: 'row',
  },
  filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#1e293b',
      borderWidth: 1,
      borderColor: '#334155'
  },
  filterChipActive: {
      backgroundColor: '#22c55e',
      borderColor: '#22c55e'
  },
  filterText: {
      color: '#94a3b8',
      fontWeight: '600',
      fontSize: 13
  },
  filterTextActive: {
      color: '#020617',
      fontWeight: 'bold'
  },
  listContent: {
    paddingHorizontal: 12,
    // Just enough padding so the last item isn't covered by the Tab Bar.
    // If you still see a gap, reduce this to 60 or 50.
    paddingBottom: 30, 
  },
  card: {
    marginBottom: 16,
    width: POSTER_WIDTH,
    position: 'relative', 
  },
  poster: {
    width: "100%",
    height: POSTER_WIDTH * 1.5,
    borderRadius: 12,
    backgroundColor: "#0f172a",
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loaderFooter: {
    paddingVertical: 20,
    // No large margin needed anymore since we rely on paddingBottom
    alignItems: "center",
  },
});