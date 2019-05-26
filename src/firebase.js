import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/database";
import "firebase/auth";

var firebaseConfig = {
  apiKey: "AIzaSyA59HItWtWS2pPbWtYLojOdTJZA3UB_nZU",
  authDomain: "react-chat-app-2cad1.firebaseapp.com",
  databaseURL: "https://react-chat-app-2cad1.firebaseio.com",
  projectId: "react-chat-app-2cad1",
  storageBucket: "react-chat-app-2cad1.appspot.com",
  messagingSenderId: "644157228497",
  appId: "1:644157228497:web:1e9e849fc13c200f"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
// Access the Realtime Database from FireStore
const rtdb = firebase.database();

export function setupPresence(user) {
  const isOfflineForRTDB = {
    state: "offline",
    lastChanged: firebase.database.ServerValue.TIMESTAMP
  };

  const isOnlineForRTDB = {
    state: "online",
    lastChanged: firebase.database.ServerValue.TIMESTAMP
  };

  const rtdbRef = rtdb.ref(`/status/${user.uid}`);

  rtdb.ref(".info/connected").on("value", async snapshot => {
    if (snapshot.val() === false) {
      return;
    }

    await rtdbRef.onDisconnect().set(isOfflineForRTDB);
    rtdbRef.set(isOnlineForRTDB);
  });
}

export { db, firebase };
