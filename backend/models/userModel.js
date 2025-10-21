// models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String, trim: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    address: {
      house: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
  },
  { timestamps: true }
);

// Hash password before saving (runs once when password field is set/modified)
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    // optional: log the raw password only for debug (REMOVE in production)
    // console.log("🔒 Hashing password before save:", this.password);
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method to compare entered password with stored hash
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   // returns boolean
//   return bcrypt.compare(enteredPassword, this.password);
// };

const User = mongoose.model("User", userSchema);
export default User;
