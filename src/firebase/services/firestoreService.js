import { db, auth } from "../config"; // Adjust path appropriately
import { 
  doc, 
  collection,
  query,
  orderBy,
  getDocs,
  setDoc, 
  deleteDoc, 
  getDoc,
  addDoc,
  increment, 
  where,
  serverTimestamp, 
  updateDoc,
  getCountFromServer,
  collectionGroup,
  limit
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
// Helper to get current user ID reliably
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};
const getUserName = () => {
  const user = auth.currentUser;
  return user ? user.displayName || "Anonymous" : "Anonymous";
}

// --- WATCHLIST FUNCTIONS ---

/**
 * Adds a show to the user's watchlist.
 * We save basic show info so we don't need to hit TVMaze just to display the list.
 */
export const addToWatchlist = async (show) => {
  try {
    const userId = getCurrentUserId();
    const showRef = doc(db, "users", userId, "watchlist", show.id.toString());
    await setDoc(showRef, { ...show, addedAt: serverTimestamp()
    });
    console.log("Added to watchlist");
  } catch (error) {
    console.error("Error adding to watchlist: ", error);
    throw error;
  }
};

export const removeFromWatchlist = async (showId) => {
  try {
    const userId = getCurrentUserId();
    const showRef = doc(db, "users", userId, "watchlist", showId.toString());
    await deleteDoc(showRef);
    console.log("Removed from watchlist");
  } catch (error) {
    console.error("Error removing from watchlist: ", error);
    throw error;
  }
};

// --- STATUS CHECKER ---

/**
 * Checks if a show is in watchlist or logged. 
 * Used to color the buttons on ShowScreen when it loads.
 */
export const getShowStatus = async (showId) => {
  try {
    const userId = getCurrentUserId();
    const sid = showId.toString();

    const watchlistRef = doc(db, "users", userId, "watchlist", sid);
    const reviewRef = doc(db, "users", userId, "logs", sid);

    // Run checks in parallel for speed
    const [watchlistSnap, reviewSnap] = await Promise.all([
      getDoc(watchlistRef),
      getDoc(reviewRef)
    ]);

    return {
      inWatchlist: watchlistSnap.exists(),
      isFavorite: reviewSnap.data()?.isFavorite || false,
      userRating: reviewSnap.data()?.rating || 0,
      reviewText: reviewSnap.data()?.reviewText || "",
    };

  } catch (error) {
    // If user isn't logged in, just return false status
    console.log("Could not verify show status (user maybe logged out)", error);
    return { inWatchlist: false, isFavorite: false, userRating: 0, reviewText: "" };
  }
};

export const fetchWatchlist = async () => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("No user ID provided for fetching watchlist");

  try {
    // 1. Define path
    const watchlistRef = collection(db, "users", userId, "watchlist");

    // 2. Create query (newest first)
    const q = query(watchlistRef, orderBy("addedAt", "desc"));

    // 3. Execute the fetch (ONE TIME ONLY)
    console.log("Fetching watchlist from Firestore...");
    const snapshot = await getDocs(q);

    // 4. Map results
    const shows = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    console.log(`Fetched ${shows.length} items.`);
    return shows;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
};

export const saveShowReview = async (show, review) => {
  try {
    const userId = getCurrentUserId();
    const reviewRef = doc(db, "users", userId, "logs", show.id.toString());
    // We store minimal show data so we can display a "My Reviews" list later
    await setDoc(reviewRef, {
      showId: show.id,
      showName: show.name,
      showPoster: show.poster,
      rating: review.rating || 0,       // Number 1-5
      isFavorite: review.isFavorite || false, // Boolean
      reviewText: review.reviewText || "", // String
      //for displaying public reviews
      authorId: userId,
      authorName: getUserName(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
};

export const fetchReviewsForShow = async (showId) => {
  try {
    // "collectionGroup" searches ALL collections named "logs" in the entire database
    const reviewsQuery = query(
      collectionGroup(db, 'logs'),
      where('showId', '==', showId),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(reviewsQuery);
    console.log(`Fetched ${snapshot.size} reviews for show ID ${showId}`);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const fetchMyReviews = async () => {
    try {
      const userId = getCurrentUserId();
      // Fetch from: users/{userId}/logs
      // We assume 'logs' collection stores the reviews as established earlier
      const q = query(collection(db, "users", userId, "logs"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Alert.alert("Error", "Could not load your reviews.");
      return [];
    }
  };

export const deleteMyReview = (reviewId, showName) => {
    Alert.alert(
      "Delete Review",
      `Are you sure you want to delete your review for "${showName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", user.uid, "logs", reviewId));
              // Optimistic update: remove from list immediately
              setReviews(prev => prev.filter(r => r.id !== reviewId));
            } catch (error) {
              Alert.alert("Error", "Could not delete review.");
            }
          }
        }
      ]
    );
  };

export const fetchFavorites = async () => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("No user ID provided for fetching favourites");

  try {
    // 1. Define path
    const FavoritesRef = collection(db, "users", userId, "logs");

    // 2. Create query (newest first)
    const q = query(FavoritesRef
      , where("isFavorite", "==", true)
      , orderBy("updatedAt", "desc")
    );

    // 3. Execute the fetch (ONE TIME ONLY)
    console.log("Fetching favorites from Firestore...");
    const snapshot = await getDocs(q);

    // 4. Map results
    const shows = snapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    console.log(`Fetched ${shows.length} items.`);
    console.log(shows);
    return shows;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  try {
    // 1. Update Auth Profile (Display Name, PhotoURL)
    // We only update if these fields are present in the data object
    if (data.displayName || data.photoURL) {
        await updateProfile(user, {
            displayName: data.displayName || user.displayName,
            photoURL: data.photoURL || user.photoURL,
        });
    }
    // 2. Update Firestore Document (Bio, Phone, etc.)
    // We filter out undefined values to avoid overwriting with null
    const firestoreUpdates = {};
    if (data.bio !== undefined) firestoreUpdates.bio = data.bio;
    if (data.phone !== undefined) firestoreUpdates.phone = data.phone;
    if (data.location !== undefined) firestoreUpdates.location = data.location;
    // Also sync the name to firestore for easier searching later
    if (data.displayName) firestoreUpdates.displayName = data.displayName;
    if (Object.keys(firestoreUpdates).length > 0) {
        const userRef = doc(db, "users", user.uid);
        // setDoc with { merge: true } creates the doc if it doesn't exist
        await setDoc(userRef, firestoreUpdates, { merge: true });
    }
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
    try {
      const userId = getCurrentUserId();
      const userRef = doc(db, "users", userId);
      const reviewsRef = collection(db, "users", userId, "logs");
      const watchlistRef = collection(db, "users", userId, "watchlist");
      const playlistsRef = collection(db, "users", userId, "playlists");

      const [userSnap, reviewsSnap, watchlistSnap, playlistsSnap] = await Promise.all([
        getDoc(userRef),
        getCountFromServer(reviewsRef),
        getCountFromServer(watchlistRef),
        getCountFromServer(playlistsRef)
      ]);
      return {
        name: userSnap.data()?.displayName || "User",
        email: auth.currentUser?.email,
        // Spread existing profile data (bio, location, etc.)
        ...(userSnap.exists() ? userSnap.data() : {}),
        // Add the counts we just fetched
        reviewCount: reviewsSnap.data().count,
        watchlistCount: watchlistSnap.data().count,
        listCount: playlistsSnap.data().count,
    };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return { 
          name: "User",
          email: auth.currentUser?.email || "", 
          reviewCount: 0, 
          watchlistCount: 0, 
          listCount: 0 
        };
    }
};

export const makePlaylist = async (playlistName) => {
  try {
    const userId = getCurrentUserId();
    const playlistsRef = collection(db, "users", userId, "playlists");
    await addDoc(playlistsRef, {
      name: playlistName,
      createdAt: serverTimestamp(),
      itemCount: 0,
      coverImage: null // Will be updated when first show is added
    });
    return true;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
};
export const deletePlaylist = async (playlistId) => {
  try {
    const userId = getCurrentUserId();
    const playlistRef = doc(db, "users", userId, "playlists", playlistId);
    await deleteDoc(playlistRef);
    return true;
  } catch (error) {
    console.error("Error deleting playlist:", error);
    throw error;
  }
};
export const getPlaylists = async () => {
  try {
    const userId = getCurrentUserId();
    const playlistsRef = collection(db, "users", userId, "playlists");
    const q = query(playlistsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};


export const addToPlaylist = async (show, playlistId) => {
  try {
    const userId = getCurrentUserId();
    const itemRef = doc(db, "users", userId, "playlists", playlistId, "shows", show.id.toString());
    const playlistRef = doc(db, "users", userId, "playlists", playlistId);
    await setDoc(itemRef, { ...show, addedAt: serverTimestamp() });
    await setDoc(playlistRef,
      { itemCount: increment(1),
        coverImage: show?.poster || null,
        updatedAt: serverTimestamp()
      }, { merge: true });
    console.log("Added to playlist");
  } catch (error) {
    console.error("Error adding to playlist: ", error);
    throw error;
  }
};

export const fetchPlaylistItems = async (playlistId) => {
  try {
    const userId = getCurrentUserId();
    const itemsRef = collection(db, "users", userId, "playlists", playlistId, "shows");
    // Order by newest added first
    const q = query(itemsRef, orderBy("addedAt", "desc"));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching playlist items:", error);
    throw error;
  }
};

export const removeShowFromPlaylist = async (playlistId, showId) => {
  try {
    const userId = getCurrentUserId();
    const itemRef = doc(db, "users", userId, "playlists", playlistId, "shows", showId.toString());
    const playlistRef = doc(db, "users", userId, "playlists", playlistId);

    await deleteDoc(itemRef);
    await updateDoc(playlistRef, {
      itemCount: increment(-1)
    });
    return true;
  } catch (error) {
    console.error("Error removing from playlist:", error);
    throw error;
  }
};