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
  where,
  serverTimestamp 
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
// Helper to get current user ID reliably
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};

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
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
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
      const docSnap = await getDoc(userRef);
      return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return {};
    }
};

