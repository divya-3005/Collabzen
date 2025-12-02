const express = require('express');
const router = express.Router();
const Comment = require('../Models/Comment');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);

// Create Comment
router.post('/', async (req, res) => {
  try {
    const { text, taskId } = req.body;
    const comment = await Comment.create({
      text,
      task: taskId,
      user: req.user.userId
    });
    const populatedComment = await comment.populate('user', 'username');
    
    // Log Activity
    const Task = require('../Models/Task');
    const Activity = require('../Models/Activity');
    const task = await Task.findById(taskId);
    if (task) {
        await Activity.create({
            text: `commented on task "${task.title}"`,
            user: req.user.userId,
            project: task.project,
            type: 'comment_added'
        });
    }

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Comments for a Task
router.get('/:taskId', async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'username')
      .sort({ createdAt: -1 }); // Newest first
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
