import { initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence exists in the RN bundle but is missing from TS definitions
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3IkabyhAKzfz8N6C96u52HaKOLeM5saY",
  authDomain: "helixa-ai.firebaseapp.com",
  projectId: "helixa-ai",
  storageBucket: "helixa-ai.firebasestorage.app",
  messagingSenderId: "203144766342",
  appId: "1:203144766342:web:2973f67a4475104e008207",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const functions = getFunctions(app, "australia-southeast2");

export default app;
