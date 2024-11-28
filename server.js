const express = require("express");
const nodemailer = require("nodemailer");
const geoip = require("geoip-lite");
const userAgentParser = require("user-agent-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helper to get IP details
async function getIPDetails(ip) {
  const location = geoip.lookup(ip) || { city: "Unknown", country: "Unknown" };
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const data = await response.json();
  return {
    ip: ip,
    city: location.city || data.city,
    country: location.country || data.country,
    region: data.regionName,
    timezone: data.timezone,
  };
}

// Middleware to capture user info and send email
app.use(async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ipDetails = await getIPDetails(ip);

    const userAgent = userAgentParser(req.headers["user-agent"]);
    const deviceModel = userAgent.device.model || "Unknown Device";

    const visitDetails = `
      Time: ${new Date().toISOString()}
      IP Address: ${ipDetails.ip}
      Location: ${ipDetails.city}, ${ipDetails.region}, ${ipDetails.country}
      Timezone: ${ipDetails.timezone}
      Device: ${deviceModel}
    `;

    // Prepare email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: "New Website Visitor Details",
      text: visitDetails,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Visitor details sent successfully!");

    // Proceed to the website response
    next();
  } catch (error) {
    console.error("Error capturing visitor details:", error);
    next();
  }
});

// Basic route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to My Website</h1>");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
