const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const cleanToken = token.replace("Bearer ", "");

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

module.exports = authMiddleware;