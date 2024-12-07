const express = require("express");
const protectedRoute = require("../middlewares/auth.middleware");
const {
  getUsers,
  getMessages,
  sendMessages,
} = require("../controllers/message.controller");
const router = express.Router();

router.get("/user", protectedRoute, getUsers);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, sendMessages);

module.exports = router;
