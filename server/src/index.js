require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");
const authRoutes = require("./routes/auth");
const kasirRoutes = require("./routes/kasir");
const gradesRoutes = require("./routes/grades");
const studyRoutes = require("./routes/study");
const tasksRoutes = require("./routes/tasks");
const flashcardsRoutes = require("./routes/flashcards");
const bookmarksRoutes = require("./routes/bookmarks");
const scheduleRoutes = require("./routes/schedule");
const cornellRoutes = require("./routes/cornell");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", kasirRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/study-sessions", (req, res, next) => {
  // Map /api/study-sessions/* to study router /sessions/*
  req.url = "/sessions" + req.url;
  studyRoutes(req, res, next);
});
app.use("/api/statistics", (req, res, next) => {
  studyRoutes(req, res, next);
});
app.use("/api/tasks", tasksRoutes);
app.use("/api/flashcards", flashcardsRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/cornell", cornellRoutes);

// Serve React frontend in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(clientDist, "index.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Server STUDETOLS v2 aktif di http://localhost:${PORT}`);
});
