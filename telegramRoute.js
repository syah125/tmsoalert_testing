const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const router = express.Router();

const AUTH_TOKEN = process.env.AUTH_TOKEN;
const tele_token = process.env.BOT_TELEGRAM_TOKEN;
const chatId = process.env.GROUP_TELEGRAM_ID;

function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, "\\$1");
}

function formatMessageMarkdownV2(rawMessage) {
  return rawMessage
    .split("\n")
    .map((line) => {
      const [label, ...rest] = line.split(":");
      if (!label || rest.length === 0) return escapeMarkdownV2(line);

      const field = label.trim();
      const value = rest.join(":").trim();

      if (["Alert Status", "Severity"].includes(field)) {
        return `*${escapeMarkdownV2(`${field}: ${value}`)}*`; // full bold
      }

      return `*${escapeMarkdownV2(field)}:* ${escapeMarkdownV2(value)}`; // field bold only
    })
    .join("\n");
}
const footer =
  "For more detailed information, including graph, bar, and gauge visualizations, please refer to your Grafana dashboard\\.\n*This is an automatically generated message – please do not reply to this message\\.*";
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

  const bot = new TelegramBot(tele_token, { polling: false });

  try {
    const formattedTitle = `*${escapeMarkdownV2(title)}*`;

    await bot.sendMessage(
      chatId,
      `${formattedTitle}\n\n${formatMessageMarkdownV2(message)}\n\n${footer}`,
      {
        parse_mode: "MarkdownV2",
      }
    );

    console.log("Success send tele");
    res.status(200).json({ message: "success forward" });
  } catch (err) {
    console.error("Forwarding error:", err.message);
    res.status(500).json({ error: "Failed to forward alert" });
  }
});

module.exports = router;
