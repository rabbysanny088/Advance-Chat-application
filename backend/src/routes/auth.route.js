const express = require("express");
const {
  handleSignup,
  handleLogin,
  handleLogout,
  handleUpdateProfile,
  checkAuth,
} = require("../controllers/auth.controller");
const protectedRoute = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);
router.put("/update-profile", protectedRoute, handleUpdateProfile);
router.get("/check", protectedRoute, checkAuth);

module.exports = router;
