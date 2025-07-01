const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const router = express.Router();

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const tele_token = process.env.BOT_TELEGRAM_TOKEN;
const chatId = process.env.GROUP_TELEGRAM_ID;

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

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing field." });
  }

  const bot = new TelegramBot(tele_token, { polling: false });

  try {
    await bot.sendMessage(
      chatId,
      "*Administrator's Custom Message*\n\n" + message,
      {
        parse_mode: "MarkdownV2",
      }
    );

    console.log("Success send manual message");
    res.status(200).json({ message: "success forward" });
  } catch (err) {
    console.error("Forwarding error:", err.message);
    res.status(500).json({ error: "Failed to forward alert" });
  }
});

module.exports = router;
