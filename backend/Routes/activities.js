const express = require('express');
const router = express.Router();
const Activity = require('../Models/Activity');
const Project = require('../Models/Project');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);

// Get Recent Activity
router.get('/', async (req, res) => {
  try {
    // 1. Find user projects
    const userProjects = await Project.find({ owner: req.user.userId }).select('_id');
    const userProjectIds = userProjects.map(p => p._id);
    
    // 2. Find activities where project is in userProjectIds OR user is the actor
    const activities = await Activity.find({
        $or: [
            { project: { $in: userProjectIds } },
            { user: req.user.userId }
        ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('user', 'username avatar');

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
