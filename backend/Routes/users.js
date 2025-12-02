const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);

// Get Current User Profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile
router.put('/profile', async (req, res) => {
  try {
    const { username, bio, location, website, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, bio, location, website, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Users (for assignment)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('username email _id avatar');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
