
import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authMiddleware from "./auth.js";

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body || {};
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password required" });

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      token: generateToken(newUser._id),
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  return res.json({
    message: "Login successful",
    user: { id: user._id, name: user.name, email: user.email },
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    }),
  });
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update address for logged-in user
router.put("/address", authMiddleware, async (req, res) => {
  try {
    const { house, street, city, state, pincode } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = { house, street, city, state, pincode };
    await user.save();

    res.json({ message: "Address updated successfully", address: user.address });
  } catch (err) {
    console.error("Address update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

 export default router;

// // routes/userRoutes.js
// import express from "express";
// import crypto from "crypto"; // ES Module import
// import nodemailer from "nodemailer"; // for sending reset emails
// import User from "../models/userModel.js";

// const router = express.Router();

// // -----------------------------
// // 🟢 REGISTER (unchanged)
// router.post("/register", async (req, res) => {
//   try {
//     let { name, email, mobile, password } = req.body || {};

//     name = name?.trim();
//     email = email?.trim().toLowerCase();
//     mobile = mobile?.trim();
//     password = password?.toString();

//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Name, email and password are required." });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already exists with this email." });
//     }

//     const newUser = new User({ name, email, mobile, password });
//     await newUser.save();

//     return res.status(201).json({
//       message: "User registered successfully",
//       user: { id: newUser._id, name: newUser.name, email: newUser.email },
//     });
//   } catch (err) {
//     console.error("❌ Register Error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// });

// // -----------------------------
// // 🔵 LOGIN (unchanged)
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body || {};
//     email = email?.trim().toLowerCase();
//     password = password?.toString();

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required." });
//     }

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid password" });

//     return res.status(200).json({
//       message: "Login successful",
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     console.error("❌ Login Error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// });

// // -----------------------------
// // 🔹 FORGOT PASSWORD
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Configure nodemailer (replace with your SMTP credentials)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: "vibrantflight99@gmail.com",
        pass: "psharleksxodrxxk", // App Password
      },
    });

    const resetURL = `http://localhost:5000/html/reset-password.html?token=${resetToken}&email=${user.email}`;
    console.log("🔗 Reset URL:", resetURL); // <-- now this works
    const mailOptions = {
      from: "vibrantflight99@gmail.com",
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetURL}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// -----------------------------
// 🔹 RESET PASSWORD
router.post("/reset", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};

    // Basic validation
    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, token, and new password are required" });
    }

    // Debugging logs (to check input values)
    console.log("📩 Incoming Email:", email);
    console.log("🔑 Incoming Token:", token);

    // Find user with valid token and expiry
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    // Log user result
    console.log("👤 User Found:", user ? user.email : "None");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password (hashed automatically in pre-save)
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "✅ Password reset successfully" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

// export default router;
