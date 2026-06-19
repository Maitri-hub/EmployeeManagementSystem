const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
const prisma = require("../config/prisma");

const router = express.Router();

// SIGNUP - Prisma version
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        role: true,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: {
        userId: newUser.id,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
      },
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
      verificationToken,
      verificationLink: `http://localhost:5173/verify-email/${verificationToken}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN - Prisma version
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email before login",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || "Employee" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
      },
    });

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "Employee",
        verified: user.verified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REFRESH TOKEN
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const tokenResult = await pool.query(
      `SELECT refresh_tokens.*, users.email, users.name, users.role
       FROM refresh_tokens
       JOIN users ON refresh_tokens.user_id = users.id
       WHERE refresh_tokens.token = $1`,
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const storedToken = tokenResult.rows[0];

    const newAccessToken = jwt.sign(
      {
        id: storedToken.user_id,
        email: storedToken.email,
        role: storedToken.role || "Employee",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "New access token generated",
      token: newAccessToken,
      user: {
        id: storedToken.user_id,
        name: storedToken.name,
        email: storedToken.email,
        role: storedToken.role || "Employee",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
        refreshToken,
      ]);
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VERIFY EMAIL
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const verificationResult = await pool.query(
      `SELECT * FROM email_verification
       WHERE token = $1 AND verified = false AND expires_at > NOW()`,
      [token]
    );

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    const verificationRecord = verificationResult.rows[0];

    await pool.query("UPDATE users SET verified = true WHERE id = $1", [
      verificationRecord.user_id,
    ]);

    await pool.query(
      "UPDATE email_verification SET verified = true WHERE id = $1",
      [verificationRecord.id]
    );

    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_reset (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    res.json({
      message: "Password reset token generated",
      resetToken,
      resetLink: `http://localhost:5173/reset-password/${resetToken}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    const resetResult = await pool.query(
      `SELECT * FROM password_reset
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const resetRecord = resetResult.rows[0];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      resetRecord.user_id,
    ]);

    await pool.query("UPDATE password_reset SET used = true WHERE id = $1", [
      resetRecord.id,
    ]);

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;