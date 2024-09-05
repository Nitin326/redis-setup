const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const {username, password} = req.body;
  console.log(username, password);
  try {
    let user = await User.findOne({username});
    console.log("user ", user);
    if (user) return res.status(400).json({message: "User already exists"});

    user = new User({username, password: await bcrypt.hash(password, 10)});
    await user.save();

    const payload = {user: {id: user.id}};
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

    res.json({token});
  } catch (err) {
    res.status(500).json({message: "Server error"});
  }
};

exports.loginUser = async (req, res) => {
  const {username, password} = req.body;
  try {
    const user = await User.findOne({username});
    if (!user) return res.status(400).json({message: "Invalid credentials"});

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({message: "Invalid credentials"});

    const payload = {user: {id: user.id}};
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

    res.json({token});
  } catch (err) {
    res.status(500).json({message: "Server error"});
  }
};
