require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      const email = "pehlajnettu@gmail.com";
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found!");
      } else {
        console.log("User Found:", user.email);
        console.log("Password Hash:", user.password);
        console.log("Created At:", user.createdAt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      process.exit(0);
    }
  })
  .catch(err => {
    console.error("Connection Error:", err);
    process.exit(1);
  });
