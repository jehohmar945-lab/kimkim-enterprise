import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCizYkL6CvN5DggN1N4Wy-p_q55a6UEDhs",
  authDomain: "kimkim-enterprise-c10d6.firebaseapp.com",
  projectId: "kimkim-enterprise-c10d6",
  storageBucket: "kimkim-enterprise-c10d6.firebasestorage.app",
  messagingSenderId: "107286919434",
  appId: "1:107286919434:web:d3f50a834c5bdc8c41a2f3"
};

const app = initializeApp(firebaseConfig);
// Force (default) database binding
export const db = getFirestore(app, "(default)");
