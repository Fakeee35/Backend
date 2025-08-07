const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const SubmissionSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  parcelName: String,
  parcelCount: Number,
  amount: Number,
  serviceDate: String,
  timestamp: { type: Date, default: Date.now },
});
const Submission = mongoose.model("Submission", SubmissionSchema);

const VolunteerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  help: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Volunteer = mongoose.model("Volunteer", VolunteerSchema);

// Newsletter API
app.post("/api/newsletter", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  const filePath = path.join(__dirname, "data", "newsletter.json");
  let list = [];

  try {
    if (fs.existsSync(filePath)) {
      list = JSON.parse(fs.readFileSync(filePath));
    }
    list.push({ email, date: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
    res.json({ message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save subscription." });
  }
});

// Contact API
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: "Missing required fields" });

  const filePath = path.join(__dirname, "data", "contacts.json");
  let list = [];

  try {
    if (fs.existsSync(filePath)) {
      list = JSON.parse(fs.readFileSync(filePath));
    }
    list.push({ name, email, message, date: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
    res.json({ message: "Message received!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving message" });
  }
});

// Donation API
app.post("/api/donate", async (req, res) => {
  const { name, email, phone, parcelName, parcelCount, amount, serviceDate } =
    req.body;

  if (!name || !email || !phone)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const newEntry = new Submission({
      name,
      email,
      phone,
      parcelName,
      parcelCount,
      amount,
      serviceDate,
    });
    await newEntry.save();
    res.json({ message: "Donation submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving donation" });
  }
});

// Donation Count API
app.get("/api/donation-count", async (req, res) => {
  try {
    const count = await Submission.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching count" });
  }
});

// Volunteer API
app.post("/api/volunteer", async (req, res) => {
  const { name, email, phone, help, message } = req.body;

  if (!name || !email || !phone || !help) {
    return res
      .status(400)
      .json({ message: "Name, email, phone, and how you want to help are required." });
  }

  try {
    const newEntry = new Volunteer({ name, email, phone, help, message });
    await newEntry.save();
    res.json({ message: "Volunteer form submitted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error saving volunteer data." });
  }
});

// Admin login API
const ADMIN_ID = "A@b@c";
const ADMIN_PASS = "A@b@c";

app.post("/api/admin-login", (req, res) => {
  const { id, password } = req.body;
  if (id === ADMIN_ID && password === ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Get all donations
app.get("/api/donations", async (req, res) => {
  try {
    const list = await Submission.find().sort({ timestamp: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching donations" });
  }
});

// Get all volunteers
app.get("/api/volunteers", async (req, res) => {
  try {
    const list = await Volunteer.find().sort({ timestamp: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching volunteers" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
