import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseAuth } from "../../config/firebase";
import type { UserProfile } from "../../types/user";
import { db } from "../../config/firebase";

/**
 * User API Service
 *
 * Handles Firestore reads/updates for the authenticated user's profile.
 */
export const userApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<UserProfile | null> => {
    const user = firebaseAuth.currentUser;
    if (!user?.uid) {
      throw new Error("No authenticated user found");
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as UserProfile;
  },

  /**
   * Update current user's profile and return fresh data
   */
  updateProfile: async (
    updatedData: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const user = firebaseAuth.currentUser;
    if (!user?.uid) {
      throw new Error("No authenticated user found");
    }

    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });

    const updatedDoc = await getDoc(userDocRef);
    if (!updatedDoc.exists()) {
      throw new Error("User profile not found after update");
    }

    return updatedDoc.data() as UserProfile;
  },
};
