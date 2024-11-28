const nodemailer = require("nodemailer");
const geoip = require("geoip-lite");
const userAgentParser = require("user-agent-parser");
const fetch = require("node-fetch");

export default async function handler(req, res) {
  try {
    // Get visitor's IP address
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "0.0.0.0";

    // Get geolocation data
    const location = geoip.lookup(ip) || {
      city: "Unknown",
      country: "Unknown",
    };
    const ipDetailsResponse = await fetch(`http://ip-api.com/json/${ip}`);
    const ipDetails = await ipDetailsResponse.json();

    // Parse User-Agent
    const userAgent = userAgentParser(req.headers["user-agent"]);
    const deviceModel = userAgent.device.model || "Unknown Device";

    // Visitor details
    const visitDetails = `
      Time: ${new Date().toISOString()}
      IP Address: ${ip}
      Location: ${location.city}, ${ipDetails.regionName || "Unknown"}, ${
      location.country
    }
      Device: ${deviceModel}
      Timezone: ${ipDetails.timezone || "Unknown"}
    `;

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: "New Website Visitor Details",
      text: visitDetails,
    });

    console.log("Visitor email sent successfully!");
    res.status(200).send("Email sent");
  } catch (error) {
    console.error("Error sending visitor email:", error);
    res.status(500).send("Failed to send email");
  }
}
