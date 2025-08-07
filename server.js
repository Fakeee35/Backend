// Sagar Ratan Foundation – Final Backend (MongoDB + Admin ID/Password)

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Admin credentials
const ADMIN_ID = "A@b@c";
const ADMIN_PASSWORD = "A@b@c";

// MongoDB URI
const MONGO_URI = "mongodb+srv://Srf44334:srf44334@cluster0.gzdgh6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Initialize
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Connect MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Schemas
const donationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  serviceDate: String,
  parcelName: String,
  parcelCount: Number,
  date: { type: Date, default: Date.now },
});

const volunteerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  help: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const newsletterSchema = new mongoose.Schema({
  email: String,
  date: { type: Date, default: Date.now },
});

// Models
const Donation = mongoose.model("Donation", donationSchema);
const Volunteer = mongoose.model("Volunteer", volunteerSchema);
const Contact = mongoose.model("Contact", contactSchema);
const Newsletter = mongoose.model("Newsletter", newsletterSchema);

// ----------- ROUTES ------------ //

// Get donation count
app.get("/api/donation-count", async (req, res) => {
  const count = await Donation.countDocuments();
  res.json({ count });
});

// Submit donation
app.post("/api/donate", async (req, res) => {
  const { name, email, phone, serviceDate, parcelName, parcelCount } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  await Donation.create({ name, email, phone, serviceDate, parcelName, parcelCount });
  res.json({ message: "Donation submitted successfully" });
});

// Submit volunteer
app.post("/api/volunteer", async (req, res) => {
  const { name, email, phone, help, message } = req.body;
  if (!name || !email || !phone || !help) {
    return res.status(400).json({ message: "Name, email, phone, and how you want to help are required." });
  }

  await Volunteer.create({ name, email, phone, help, message });
  res.json({ message: "Volunteer submitted successfully" });
});

// Submit contact
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All contact fields are required" });
  }

  await Contact.create({ name, email, message });
  res.json({ message: "Contact message submitted successfully" });
});

// Subscribe to newsletter
app.post("/api/newsletter", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return res.json({ message: "Already subscribed!" });
  }

  await Newsletter.create({ email });
  res.json({ message: "Subscribed successfully!" });
});

// Admin login
app.post("/api/admin-login", (req, res) => {
  const { id, password } = req.body;
  if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Admin data fetch
app.get("/api/admin-data", async (req, res) => {
  const donations = await Donation.find();
  const volunteers = await Volunteer.find();
  const contacts = await Contact.find();
  const newsletters = await Newsletter.find();

  res.json({ donations, volunteers, contacts, newsletters });
});

// Fallback to frontend
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
