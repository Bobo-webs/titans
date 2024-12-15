import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZS-Ry4ddvIN-FkXohNidSZgTInnfzVtI",
  authDomain: "titans-token.firebaseapp.com",
  databaseURL: "https://titans-token-default-rtdb.firebaseio.com",
  projectId: "titans-token",
  storageBucket: "titans-token.firebasestorage.app",
  messagingSenderId: "996300344426",
  appId: "1:996300344426:web:1ed9e4dcdd3b52098a0e13",
  measurementId: "G-W39KLMEDSZ",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to collect visitor data
async function collectVisitorData() {
  try {
    // Fetch IP and location data
    const ipResponse = await fetch("https://ipapi.co/json/");
    const ipData = await ipResponse.json();

    // Detect device model using userAgent
    const userAgent = navigator.userAgent;
    let deviceModel = "Unknown Device";

    if (/android/i.test(userAgent)) {
      deviceModel = "Android";
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      deviceModel = "iOS";
    } else if (/Windows/.test(userAgent)) {
      deviceModel = "Windows Device";
    } else if (/Mac/.test(userAgent)) {
      deviceModel = "MacOS Device";
    } else if (/Linux/.test(userAgent)) {
      deviceModel = "Linux Device";
    }

    // Validate collected data
    const ip = ipData.ip || "N/A";
    const location =
      ipData.region && ipData.country_name
        ? `${ipData.region}, ${ipData.country_name}`
        : "N/A";

    if (
      ip === "N/A" ||
      location === "N/A" ||
      deviceModel === "Unknown Device"
    ) {
      throw new Error("Incomplete visitor data detected");
    }

    return { ip, location, device: deviceModel };
  } catch (error) {
    console.error("Error collecting visitor data:", error);
    return null; // Return null to indicate failure
  }
}

// Function to push visitor data to Firebase
async function pushVisitorDataToFirebase(visitorData) {
  try {
    const visitorsDetailsRef = ref(database, "visitors_details");
    const newEntryRef = push(visitorsDetailsRef);

    await set(newEntryRef, {
      device_Model: visitorData.device,
      ip_Address: visitorData.ip,
      location: visitorData.location,
      timestamp: serverTimestamp(), // Use Firebase server timestamp
    });

    console.log(
      "Visitor data successfully pushed to Firebase under visitors_details."
    );
  } catch (error) {
    console.error("Error pushing visitor data to Firebase:", error);
  }
}

// Send visitor data when the website is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const visitorData = await collectVisitorData();

    // Abort if visitor data retrieval failed
    if (!visitorData) {
      console.warn("Visitor data is incomplete or invalid; email not sent.");
      return;
    }

    const params = {
      LOCATION: visitorData.location,
      IP_ADDRESS: visitorData.ip,
      DEVICE_MODEL: visitorData.device,
    };

    const serviceID = "service_tp3e91n";
    const templateID = "template_n52fkpv";

    // Send email using EmailJS
    await emailjs.send(serviceID, templateID, params);
    console.log("Visitor details email sent successfully");

    // Push data to Firebase
    await pushVisitorDataToFirebase(visitorData);
  } catch (err) {
    console.error("Error handling visitor data:", err);
  }
});
