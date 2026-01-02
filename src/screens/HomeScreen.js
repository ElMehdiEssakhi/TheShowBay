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
  Animated, // Import Animated
  TouchableWithoutFeedback // To close menu when tapping outside
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const POSTER_WIDTH = width / 3 - 16;
const BATCH_SIZE = 12;

export default function HomeScreen({ navigation }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // --- FAB ANIMATION STATE ---
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // TVMaze logic
  const currentPageRef = useRef(Math.floor(Math.random() * 200)); 

  useEffect(() => {
    loadMoreShows();
  }, []);

  // --- 1. FAB TOGGLE LOGIC ---
  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    
    setMenuOpen(!menuOpen);
  };

 const FAB_SIZE = 58;
 const SUB_FAB_SIZE = 44;
 const RADIUS = FAB_SIZE; 
  
  const getRadialStyle = (animation, angleDeg) => {
      const angle = (angleDeg * Math.PI) / 180;
      const x = Math.cos(angle) * RADIUS;
      const y = Math.sin(angle) * RADIUS;
      return {
        opacity: animation,
        transform: [
          { scale: animation },
          {
            translateX: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, x],
            }),
          },
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, y],
            }),
          },
        ],
      };
  };

const reviewStyle = getRadialStyle(animation, -70);  // straight up
const playlistStyle = getRadialStyle(animation, 0);

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"], // Rotate + to x
        }),
      },
    ],
  };

  // --- 2. DATA LOGIC (UNCHANGED) ---
  const isValidShow = (show) => {
    const isScripted = show.type === "Scripted";
    const hasImage = show.image?.medium;
    const isModern = show.premiered && parseInt(show.premiered) >= 2000;
    const isGoodQuality = (show.rating?.average >= 5.0) || (show.weight > 70);
    const isEnglish = show.language === "English" || show.language === "English (US)";
    return isScripted && hasImage && isModern && isGoodQuality && isEnglish;
  };

  const fetchValidBatch = async (startPage, accumulatedShows = []) => {
    try {
      if (accumulatedShows.length >= BATCH_SIZE) {
        return { shows: accumulatedShows, nextPage: startPage };
      }
      // console.log(`Fetching page ${startPage}...`);
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
      if (err.response && err.response.status === 404) return { shows: accumulatedShows, nextPage: startPage };
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

  // --- RENDERERS ---
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
    if (!loading) return <View style={{ height: 100 }} />;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#22c55e" />
        <Text style={{color: "#6b7280", fontSize: 10, marginTop: 5}}>Looking for good shows...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* If menu is open, show a dark overlay to close it when tapped */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Discover</Text>
      </View>

      <FlatList
        data={shows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderShow}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={styles.listContent}
        onEndReached={() => loadMoreShows(false)}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />

      {/* --- EXPANDABLE FAB --- */}
      <View style={styles.fabContainer}>
        
        {/* Option 1: Add Review */}
        <Animated.View style={[styles.subButtonContainer, reviewStyle]}>
          <TouchableOpacity style={styles.subFab} onPress={() => alert("Review Feature Coming Soon!")}>
            <Ionicons name="pencil" size={20} color="#020617" />
          </TouchableOpacity>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Add Review</Text>
          </View>
        </Animated.View>

        {/* Option 2: Add Playlist */}
        <Animated.View style={[styles.subButtonContainer, playlistStyle]}>
          <TouchableOpacity style={styles.subFab} onPress={() => alert("Playlist Feature Coming Soon!")}>
            <Ionicons name="list" size={20} color="#020617" />
          </TouchableOpacity>
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>New Playlist</Text>
          </View>
        </Animated.View>

        {/* Main Button */}
        <TouchableOpacity style={styles.fab} onPress={toggleMenu} activeOpacity={0.8}>
          <Animated.View style={rotation}>
            <Ionicons name="add" size={28} color="#020617" />
          </Animated.View>
        </TouchableOpacity>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: Platform.OS === "android" ? 25 : 0, 
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 9, 
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#020617",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#e5e7eb",
    marginVertical: 10,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
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
    marginBottom: 80,
    alignItems: "center",
  },
  
  /* --- FAB STYLES --- */
  fabContainer: {
    position: "absolute",
    bottom: 20,
    left: 20, // Kept left as per your code (though usually right) 
    zIndex: 10,
    width: 60, 
    height: 60,
  },
  fab: {
    backgroundColor: "#22c55e",
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  subButtonContainer: {
    position: "absolute",
    bottom: 7,
    left: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  subFab: {
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginLeft: 10, // Space between label and button
  },
  labelContainer: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 10,
  },
  labelText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
});