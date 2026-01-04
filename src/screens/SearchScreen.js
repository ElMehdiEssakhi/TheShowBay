import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const SPACING = 12;
const POSTER_WIDTH = (width - SPACING * 4) / 3;

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // To track if a search happened

  // --- SEARCH LOGIC ---
  const searchShows = async (text) => {
    if (!text.trim()) {
        setResults([]);
        setSearched(false);
        return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const response = await axios.get(
        `https://api.tvmaze.com/search/shows?q=${text}`
      );
      // TVMaze search returns an array of objects: { score: 12, show: { ... } }
      // We map it to just get the 'show' object
      const shows = response.data.map(item => item.show);
      setResults(shows);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DEBOUNCE EFFECT ---
  // Wait 500ms after user stops typing before hitting the API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchShows(query);
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);


  // --- RENDERERS ---
  const renderItem = ({ item }) => {
    // Only show items with images to keep the grid looking good
    const imageUri = item.image?.medium;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Show", { showId: item.id })} // Navigate to Stack Screen
      >
        {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.poster} resizeMode="cover" />
        ) : (
            <View style={[styles.poster, styles.placeholderPoster]}>
                <Ionicons name="image-outline" size={32} color="#475569" />
            </View>
        )}
        
        <LinearGradient
            colors={["transparent", "rgba(2, 6, 23, 0.9)"]}
            style={styles.gradient}
        />
        <Text numberOfLines={2} style={styles.title}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#94a3b8" style={{marginRight: 8}} />
            <TextInput
                style={styles.input}
                placeholder="Find movies, shows..."
                placeholderTextColor="#64748b"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                returnKeyType="search"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(""); Keyboard.dismiss(); }}>
                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                </TouchableOpacity>
            )}
        </View>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={3}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={{ gap: SPACING }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
                searched && query.length > 0 ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No results found for "{query}"</Text>
                    </View>
                ) : (
                    !searched && (
                        <View style={styles.centerContainer}>
                            <Ionicons name="search-outline" size={64} color="#1e293b" />
                            <Text style={styles.placeholderText}>Search for your favorite shows</Text>
                        </View>
                    )
                )
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#334155",
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    height: "100%",
  },
  listContent: {
    paddingHorizontal: SPACING,
    paddingBottom: 20,
    gap: SPACING,
    minHeight: 300, // Ensure empty state centers correctly
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  
  /* Card Styles */
  card: {
    width: POSTER_WIDTH,
    height: POSTER_WIDTH * 1.5,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    overflow: "hidden",
    position: "relative",
    marginBottom: SPACING,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  placeholderPoster: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1e293b'
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  title: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 2
  },
  
  /* Text Styles */
  emptyText: {
      color: "#94a3b8",
      fontSize: 16,
      textAlign: 'center'
  },
  placeholderText: {
      color: "#475569",
      marginTop: 16,
      fontSize: 14
  }
});