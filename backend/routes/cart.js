import express from "express";
import Cart from "../models/cartModel.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// 🛒 GET cart items for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    res.json({ cart: cart || { items: [] } });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ➕ POST add product to cart
router.post("/", authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    return res.status(400).json({ message: "Product ID required" });
  }

  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity: Number(quantity) }],
      });
    } else {
      // Increment if exists, else push
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += Number(quantity);
      } else {
        cart.items.push({ product: productId, quantity: Number(quantity) });
      }
    }

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    res.json({ message: "Product added to cart", cart: updatedCart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ❌ DELETE specific product from cart
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    res.json({ message: "Removed from cart", cart: updatedCart });
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🧹 CLEAR all items from the user's cart
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

// import express from "express";
// import Cart from "../models/cartModel.js";
// import { authMiddleware } from "../middleware/auth.js";

// const router = express.Router();

// // 🛒 GET cart items for logged-in user
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
//     res.json({ cart: cart || { items: [] } });
//   } catch (err) {
//     console.error("Fetch cart error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ➕ POST add product to cart
// router.post("/", authMiddleware, async (req, res) => {
//   const { productId, quantity } = req.body;
//   if (!productId || !quantity) {
//     return res.status(400).json({ message: "Product ID and quantity required" });
//   }

//   try {
//     // Find cart for the current user
//     let cart = await Cart.findOne({ user: req.user._id });

//     if (cart) {
//       // Check if product already exists in cart
//       const existingItem = cart.items.find(
//         (item) => item.product.toString() === productId
//       );

//       if (existingItem) {
//         // Update quantity
//         existingItem.quantity += Number(quantity);
//       } else {
//         // Add new product to cart
//         cart.items.push({ product: productId, quantity: Number(quantity) });
//       }

//       await cart.save();
//     } else {
//       // Create a new cart for the user
//       cart = new Cart({
//         user: req.user._id,
//         items: [{ product: productId, quantity: Number(quantity) }],
//       });
//       await cart.save();
//     }

//     const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
//     res.json({ message: "Product added to cart", cart: updatedCart });
//   } catch (err) {
//     console.error("Add to cart error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ❌ DELETE specific product from cart
// router.delete("/:productId", authMiddleware, async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const cart = await Cart.findOne({ user: req.user._id });

//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     // Remove the product from items array
//     cart.items = cart.items.filter(
//       (item) => item.product.toString() !== productId
//     );

//     await cart.save();

//     const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
//     res.json({ message: "Removed from cart", cart: updatedCart });
//   } catch (err) {
//     console.error("Remove cart item error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // 🧹 CLEAR all items from the user's cart
// router.delete("/", authMiddleware, async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     cart.items = []; // clear all products
//     await cart.save();

//     res.json({ message: "Cart cleared successfully", cart });
//   } catch (err) {
//     console.error("Clear cart error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;
