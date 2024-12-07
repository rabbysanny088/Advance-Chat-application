const mongoose = require("mongoose");

const connectToMonGoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MonGoDb Connected");
  } catch (error) {
    console.log("Error in connectToMonGoDB", error);
    process.exit(1);
  }
};

module.exports = connectToMonGoDB;
