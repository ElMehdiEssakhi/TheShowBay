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
  serverTimestamp 
} from "firebase/firestore";

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

// --- LOGGING/REVIEW FUNCTIONS ---

/**
 * Logs a show as watched with an optional rating and review.
 */
export const logShow = async (show, rating = null, review = "") => {
  try {
    const userId = getCurrentUserId();
    // Using showId as doc ID ensures a user only logs a show once. 
    // If they log it again, it updates the existing review.
    const logRef = doc(db, "users", userId, "logs", show.id.toString());

    const logData = {
      showId: show.id,
      name: show.name,
      poster: show.image?.medium || null,
      watchedAt: serverTimestamp(),
      rating: rating, // e.g., 1 to 5, or null
      review: review, // string
    };

    await setDoc(logRef, logData, { merge: true });
    console.log("Show logged successfully");
  } catch (error) {
    console.error("Error logging show: ", error);
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
    const logRef = doc(db, "users", userId, "logs", sid);

    // Run checks in parallel for speed
    const [watchlistSnap, logSnap] = await Promise.all([
      getDoc(watchlistRef),
      getDoc(logRef)
    ]);

    return {
      inWatchlist: watchlistSnap.exists(),
      isLogged: logSnap.exists(),
      userRating: logSnap.exists() ? logSnap.data().rating : null,
    };

  } catch (error) {
    // If user isn't logged in, just return false status
    console.log("Could not verify show status (user maybe logged out)");
    return { inWatchlist: false, isLogged: false, userRating: null };
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
