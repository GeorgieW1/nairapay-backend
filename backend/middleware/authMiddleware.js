
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: "No token provided" }); // Consistent error message
  }

  // ✅ Flexible Token Extraction (Handle "Bearer " prefix or raw token)
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7, authHeader.length).trim()
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    next();
  };
};