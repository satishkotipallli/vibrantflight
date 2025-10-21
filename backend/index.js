import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/connect.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cart.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import nodemailer from "nodemailer";
import open from "open"; // 🆕 Auto-open browser

dotenv.config();
const app = express();

// ✅ ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ✅ Serve all frontend assets properly
app.use("/css", express.static(path.join(__dirname, "frontend/css")));
app.use("/js", express.static(path.join(__dirname, "frontend/js")));
app.use("/images", express.static(path.join(__dirname, "frontend/images")));
app.use("/", express.static(path.join(__dirname, "frontend/html")));

// ✅ Home route (http://localhost:5000/)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/html/index.html"));
});

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: Date.now() })
);

// ✅ Fallback for non-API routes (optional, for SPAs)
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "frontend/html/index.html"));
  } else {
    next();
  }
});

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Nodemailer verification failed:", error);
  } else {
    console.log("✅ Nodemailer is ready to send emails!");
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      // 🆕 Automatically open browser to index.html
      open(`http://localhost:${PORT}`);
    })
  )
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });

// ✅ Global error handler (keep this last)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: "Internal Server Error" });
});
