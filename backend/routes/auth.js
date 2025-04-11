const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  try {
    let user = await User.findOne({ username });

    if (!user) {
      user = new User({ username, password });
      await user.save();
    }

    res.json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
