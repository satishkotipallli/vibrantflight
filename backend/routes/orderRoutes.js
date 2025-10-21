import express from "express";
import jwt from "jsonwebtoken";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

const router = express.Router();

//  Middleware to verify user token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

//  Create Order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: "No items in order" });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      address,
      paymentMethod,
    });

    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } } // removes all items from cart
    );

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("❌ Order Create Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Get Logged-in User’s Orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get All Orders
router.get("/all", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });

  try {
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//  Update Order Status (Admin)
router.put("/:id/status", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });

  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
