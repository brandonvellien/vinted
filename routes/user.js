const express = require("express");
const User = require("../models/User");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/user/signup", isAuthenticated, async (req, res) => {
  try {
    //console.log(req.body);
    const SHA256 = require("crypto-js/sha256");
    const encBase64 = require("crypto-js/enc-base64");
    const uid2 = require("uid2");
    const password = req.body.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const generateToken = uid2(16);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Vérification si  le username est renseigné

    if (!req.body.username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // console.log(salt);
    // console.log(hash);
    console.log(generateToken);

    const newUser = new User({
      account: {
        username: req.body.username,
      },
      email: req.body.email,

      token: generateToken,
      newsletter: req.body.newsletter,
      hash: hash,
      salt: salt,
    });
    console.log(newUser);
    await newUser.save();
    res.json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "email or password incorrect" });
    }
    const passwordHashed = SHA256(req.body.password + user.salt).toString(
      encBase64
    );
    if (passwordHashed === user.hash) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

////
module.exports = router;
