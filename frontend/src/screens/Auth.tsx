import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyDTaUOi2XJKKOQJJmhoutOtHZzmM8QbH-w",
  authDomain: "chess-c3ac9.firebaseapp.com",
  projectId: "chess-c3ac9",
  storageBucket: "chess-c3ac9.appspot.com",
  messagingSenderId: "268519890943",
  appId: "1:268519890943:web:6024d4d120b92ad1c8d1ca",
  measurementId: "G-LMC6B05B9S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const Auth = () => {
  const navigate = useNavigate();
  const handleGoogle = async () => {
    // Removed unused parameter e
    try {
      console.log("Attempting Google sign-in...");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in successful:", result.user.displayName);
      console.log("Email:", result.user.email);
      navigate("/game");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div>
      <button className="text-white text-3xl" onClick={handleGoogle}>
        Sign In With Google!
      </button>
    </div>
  );
};
