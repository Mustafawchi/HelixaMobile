import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { firebaseAuth, db } from "../../config/firebase";
import type {
  Doctor,
  CreateDoctorPayload,
  UpdateDoctorPayload,
} from "../../types/generate";

function getDoctorsCollection() {
  const user = firebaseAuth.currentUser;
  if (!user?.uid) {
    throw new Error("No authenticated user found");
  }
  return collection(db, "users", user.uid, "doctors");
}

export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    const q = query(getDoctorsCollection(), orderBy("surname"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Doctor, "id">),
    }));
  },

  add: async (payload: CreateDoctorPayload): Promise<Doctor> => {
    const docRef = await addDoc(getDoctorsCollection(), payload);
    return { id: docRef.id, ...payload };
  },

  update: async (id: string, payload: UpdateDoctorPayload): Promise<void> => {
    const docRef = doc(getDoctorsCollection(), id);
    await updateDoc(docRef, { ...payload });
  },

  remove: async (id: string): Promise<void> => {
    const docRef = doc(getDoctorsCollection(), id);
    await deleteDoc(docRef);
  },
};
