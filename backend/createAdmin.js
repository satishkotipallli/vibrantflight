// createAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Admin model
import Admin from "./models/adminModel.js"; // make sure the path is correct

dotenv.config();

// Replace with your Atlas URI if not using .env
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected to:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const createAdmin = async () => {
  await connectDB();

  // Delete any existing admin with the same email (optional)
  await Admin.deleteMany({ email: "admin@example.com"});
  console.log("✅ Old admin (if any) deleted");

  // Create new admin with hashed password
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await Admin.create({
    name: "Super Admin",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ New Admin created:");
  console.log({
    name: admin.name,
    email: admin.email,
    role: admin.role,
    _id: admin._id,
  });

  // Close DB connection
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

createAdmin();
