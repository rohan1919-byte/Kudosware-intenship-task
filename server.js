// server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

const upload = multer({ storage: storage });

// Define the User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resumeUrl: String,
});

const User = mongoose.model("User", userSchema);

// Routes
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const resumeUrl = req.file.path;

    const newUser = new User({ name, email, phone, resumeUrl });
    await newUser.save();

    res.send("User information and resume uploaded successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Serve the signup form HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
