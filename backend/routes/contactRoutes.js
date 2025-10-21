import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 📬 POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  try {
    // 🧩 Ensure receiver email is properly defined
    const receiverEmail = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;
    if (!receiverEmail) {
      console.error("❌ Missing RECEIVER_EMAIL or EMAIL_USER in .env");
      return res.status(500).json({ message: "Email recipient not configured on the server." });
    }

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // ✅ Build email
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: receiverEmail, // guaranteed to exist now
      subject: "📩 New Contact Message from Vibrant Flight Website",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "Not provided"}</p>
          <p><b>Message:</b></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
      `,
    };

    // ✉️ Send the mail
    await transporter.sendMail(mailOptions);

    console.log(`✅ Message sent successfully to ${receiverEmail}`);
    res.json({ message: "✅ Message sent successfully!" });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    res.status(500).json({ message: "Failed to send message. Check email configuration." });
  }
});

export default router;
