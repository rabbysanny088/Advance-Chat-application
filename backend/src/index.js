require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouters = require("./routes/auth.route");
const messageRouters = require("./routes/message.route");
const connectToMonGoDB = require("./lib/db/connectMonDb");
const { app, server } = require("./lib/socket");

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use("/api/auth", authRouters);
app.use("/api/messages", messageRouters);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  connectToMonGoDB();
});
