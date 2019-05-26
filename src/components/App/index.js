import React, { useState, useEffect } from "react";
import Nav from "../Nav";
import Channel from "../Channels";
import { firebase, db, setupPresence } from "../../firebase";
import { Router, Redirect } from "@reach/router";

function App() {
  const user = useAuth();
  return user ? (
    <div className="App">
      <Nav user={user} />
      <Router>
        <Channel path="channel/:channelId" user={user} />
        <Redirect from="/" to="channel/general" />
      </Router>
    </div>
  ) : (
    <Login />
  );
}

const Login = () => {
  const [authError, setAuthError] = useState(null);

  const handleSignIn = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      setAuthError(error);
    }
  };

  return (
    <div className="login">
      <h1> Welcome to Chat! </h1>
      <button onClick={handleSignIn}> Sign in with Google </button>
      {authError && (
        <div>
          <p>Sorry, there was a problem logging in!</p>
          <p>
            <i>{authError.message}</i>
          </p>
          {authError.message ===
            "The popup has been closed by the user before finalizing the operation." && (
            <p>Please try again</p>
          )}
        </div>
      )}
    </div>
  );
};

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const user = {
          displayName: firebaseUser.displayName,
          displayPhoto: firebaseUser.photoURL,
          uid: firebaseUser.uid
        };
        setUser(user);
        db.collection("users")
          .doc(user.uid)
          .set(user, { merge: true });

        setupPresence(user);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);
  return user;
};

export default App;
