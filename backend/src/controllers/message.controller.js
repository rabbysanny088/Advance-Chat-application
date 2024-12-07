const Message = require("../models/message.model");
const cloudinary = require("../lib/cloudinary");
const User = require("../models/auth.model");
const { getReceiverSocketId, io } = require("../lib/socket");
const getUsers = async (req, res) => {
  const loggedInUserId = req.user._id;
  try {
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsers", error.message);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

const getMessages = async (req, res) => {
  const myId = req.user._id;
  const { id: userToChatId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages", error.message);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

const sendMessages = async (req, res) => {
  const { text, image } = req.body;
  const { id: receiverId } = req.params;
  const myId = req.user._id;
  let imageUrl;
  try {
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessages", error.message);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

module.exports = { getUsers, getMessages, sendMessages };
