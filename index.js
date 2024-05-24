require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

// import de mes routes
const userRoutes = require("./routes/user");

const offerRoutes = require("./routes/offer");

//utilisation de mes routes
app.use(userRoutes);
app.use(offerRoutes);

//////
app.all("*", (req, res) => {
  res.status(404).json({ message: "all routes" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
