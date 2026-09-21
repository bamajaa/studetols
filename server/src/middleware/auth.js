const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "rahasia_studetols_2026";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Akses ditolak" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token tidak valid" });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Hanya admin" });
  next();
};

module.exports = { authenticateToken, isAdmin, JWT_SECRET };
