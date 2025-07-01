const express = require("express");

const nodemailer = require("nodemailer");
const router = express.Router();

// Security token
const AUTH_TOKEN =
  "qXxWtom1rjXi3pCOTJAdviWJoDf2MF9bKE6IwmA1SpJvBgyGbV0aQQJMkzwlFD9Y";

// POST /api/send-email
router.post("/", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    token !== AUTH_TOKEN
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Missing title or message" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "mail.airstar.com.my",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD.toString(),
      },
    });

    await transporter.sendMail({
      from: `"${process.env.SMTP_DISPLAYNAME}" <${process.env.SMTP_USERNAME}>`,
      to: process.env.SMTP_RECIPIENT,
      subject: "Alert: " + title,
      text: message,
      html: `<div style="font-family: Calibri, sans-serif; white-space: pre-wrap;">${message}</div>`,
    });

    console.log("Forwarded alert via email:", title);
    res.json({ success: true });
    res.status(200).json({ message: "success forward" });
  } catch (err) {
    console.error("Forwarding error:", err.message);
    res.status(500).json({ error: "Failed to forward alert" });
  }
});

module.exports = router;
