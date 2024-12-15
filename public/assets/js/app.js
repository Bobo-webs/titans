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

// Send visitor data when the website is loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Prevent duplicate email sending
    if (localStorage.getItem("emailSent")) {
      console.log("Email already sent; skipping duplicate email.");
      return;
    }

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

    const serviceID = "service_dbrgb8h"; // Replace with your service ID
    const templateID = "template_qwvf6sj"; // Replace with your template ID

    // Send email using EmailJS
    await emailjs.send(serviceID, templateID, params);
    console.log("Visitor details email sent successfully");

    // Mark as sent to prevent duplicates
    localStorage.setItem("emailSent", "true");
  } catch (err) {
    console.error("Error sending visitor details email:", err);
  }
});

// Clear browser cache suggestion
console.log(
  "If you are facing cache issues, clear your browser cache and reload the page."
);
