const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

/* ===========================
   Middleware
=========================== */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/* ===========================
   Static Files
=========================== */

app.use(express.static(path.join(__dirname, "public")));

/* ===========================
   MongoDB Connection
=========================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed");
    console.log(err.message);
  });

/* ===========================
   Routes
=========================== */

app.use("/api/auth", require("./routes/auth"));

/* ===========================
   Home Route
=========================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===========================
   API Status
=========================== */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "RBAC Authentication API Running",
  });
});

/* ===========================
   404 Handler
=========================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* ===========================
   Server
=========================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});