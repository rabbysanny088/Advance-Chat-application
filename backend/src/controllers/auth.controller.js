const generateToken = require("../lib/generateToken");
const User = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const cloudinary = require("../lib/cloudinary");

const handleSignup = async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!email || !fullName || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long!" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(401).json({ error: "Invalid data!" });
    }
  } catch (error) {
    console.log("Error in handleSignup", error.message);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials! password is wrong" });
    }

    generateToken(user._id, res);
    await user.save();

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in handleLogin", error.message);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

const handleLogout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in handleLogout", error.message);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

const handleUpdateProfile = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;
  try {
    if (!profilePic) {
      return res.status(400).json({ message: "ProfilePic is required" });
    }

    const uploadRes = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadRes.secure_url,
      },
      { new: true }
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in handleUpdateProfile", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

module.exports = {
  handleSignup,
  handleLogin,
  handleLogout,
  handleUpdateProfile,
  checkAuth,
};
