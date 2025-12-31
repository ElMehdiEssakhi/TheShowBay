import { useState } from "react";
import {
  Button,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchShows = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
      const data = await res.json();
      setShows(data);
    } catch (err) {
      alert("Failed to fetch shows");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const show = item.show;
    return (
      <View style={styles.showCard}>
        {show.image?.medium && (
          <Image source={{ uri: show.image.medium }} style={styles.showImage} />
        )}
        <View style={styles.showInfo}>
          <Text style={styles.showTitle}>{show.name}</Text>
          <Text numberOfLines={3}>{show.summary?.replace(/<[^>]+>/g, "")}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search shows..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <Button title="Search" onPress={searchShows} />
      </View>

      {loading && <Text>Loading...</Text>}

      <FlatList
        data={shows}
        keyExtractor={(item) => item.show.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => signOut(auth)}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  welcome: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  searchContainer: { flexDirection: "row", marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  showCard: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  showImage: { width: 100, height: 140 },
  showInfo: { flex: 1, padding: 10 },
  showTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
