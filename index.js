require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const emailRoute = require("./emailRoute");
const telegramRoute = require("./telegramRoute");
const telegramRouteManual = require("./telegramRouteManual");

const app = express();
app.use(bodyParser.json());

app.use("/api/send-email", emailRoute);
app.use("/api/send-telegram", telegramRoute);
app.use("/api/send-telegram-manual", telegramRouteManual);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
