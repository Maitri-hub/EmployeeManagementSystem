const express = require("express");
const prisma = require("../config/prisma");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", authMiddleware, authorize("admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});

router.get("/admin", authMiddleware, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin! You have access to this route.",
    user: req.user,
  });
});

module.exports = router;