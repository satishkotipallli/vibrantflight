import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

const router = express.Router();

// 🔹 Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

//
// ==============================
// 🟢 REGISTER (User only)
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password required" });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim()});
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password: password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: "user" },
      token: generateToken(user._id, "user"),
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

//
// ==============================
// 🔵 LOGIN (Admin + User)
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const lowerEmail = email.toLowerCase();

    // 1️⃣ Check Admin
    const admin = await Admin.findOne({ email: lowerEmail});
    if (admin) {
      const isAdminMatch = await bcrypt.compare(password, admin.password);
      if (!isAdminMatch)
        return res.status(401).json({ message: "Invalid admin credentials" });

      return res.status(200).json({
        message: "Welcome Admin!",
        token: generateToken(admin._id, "admin"),
        user: { id: admin._id, name: admin.name, email: admin.email, role: "admin" },
      });
    }

    // 2️⃣ Check Normal User
    const user = await User.findOne({ email: lowerEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isUserMatch = await bcrypt.compare(password, user.password);
    if (!isUserMatch)
      return res.status(401).json({ message: "Invalid user credentials" });

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id, "user"),
      user: { id: user._id, name: user.name, email: user.email, role: "user" },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

//
// ==============================
// 🟠 FORGOT PASSWORD
// ==============================
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "vibrantflight99@gmail.com",
        pass: "psharleksxodrxxk", // App password
      },
    });

    const resetURL = `http://localhost:5000/html/reset-password.html?token=${resetToken}&email=${user.email}`;
    const mailOptions = {
      from: "vibrantflight99@gmail.com",
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetURL}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

//
// ==============================
// 🟢 RESET PASSWORD
// ==============================
router.post("/reset", async (req, res) => {
  try {
    const { email, token, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ==============================
// 🧩 AUTH MIDDLEWARE (Protect Routes)
// ==============================
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ==============================
// 👤 GET LOGGED-IN USER DETAILS
// ==============================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("User Fetch Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
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






// import express from "express";
// import User from "../models/userModel.js";
// import Admin from "../models/adminModel.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const router = express.Router();

// // Generate JWT
// const generateToken = (id, role) =>
//   jwt.sign({ id, role }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN || "1d",
//   });

// // REGISTER (Normal User)
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ message: "All fields required" });

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser)
//       return res.status(400).json({ message: "User already exists" });

//     // Hash password and create user
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//     });

//     res.status(201).json({
//       message: "User registered successfully",
//       user: { id: user._id, name: user.name, email: user.email, role: "user" },
//       token: generateToken(user._id, "user"),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // LOGIN (Admin or User)
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required" });

//     const lowerEmail = email.toLowerCase();

//     // 1️⃣ Check admin first
//     const admin = await Admin.findOne({ email: lowerEmail });
//     if (admin) {
//       const isMatch = await bcrypt.compare(password, admin.password);
//       if (!isMatch)
//         return res.status(401).json({ message: "Invalid admin credentials" });

//       return res.json({
//         message: "Welcome Admin!",
//         token: generateToken(admin._id, "admin"),
//         user: { name: admin.name, email: admin.email, role: "admin" },
//       });
//     }

//     // 2️⃣ Check normal user
//     const user = await User.findOne({ email: lowerEmail });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isUserMatch = await bcrypt.compare(password, user.password);
//     if (!isUserMatch)
//       return res.status(401).json({ message: "Invalid user credentials" });

//     return res.json({
//       message: "Login successful!",
//       token: generateToken(user._id, "user"),
//       user: { name: user.name, email: user.email, role: "user" },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// // LOGIN
// // router.post("/login", async (req, res) => {
// //   const { email, password } = req.body;
// //   const user = await User.findOne({ email });
// //   if (!user) return res.status(401).json({ message: "Invalid email or password" });

// //   const isMatch = await bcrypt.compare(password, user.password);
// //   if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

// //   res.json({
// //     _id: user._id,
// //     name: user.name,
// //     email: user.email,
// //     token: generateToken(user._id),
// //   });
// // });

// export default router;

