const express = require('express');
const router = express.Router();
const Project = require('../Models/Project');
const authenticateToken = require('../middleware/authenticateToken');

// Middleware to ensure authentication
router.use(authenticateToken);

// Create Project
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user.userId
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Projects (with pagination, search, sort)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort } = req.query;
    
    // Find projects owned by user OR projects where user has assigned tasks
    // 1. Get all tasks assigned to user
    const Task = require('../Models/Task');
    const assignedTasks = await Task.find({ assignedTo: req.user.userId }).select('project');
    const assignedProjectIds = assignedTasks.map(t => t.project);

    const query = {
      $or: [
        { owner: req.user.userId },
        { _id: { $in: assignedProjectIds } }
      ]
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort) {
        // format: field:asc or field:desc
        const [field, order] = sort.split(':');
        sortOption = { [field]: order === 'desc' ? -1 : 1 };
    }

    const projects = await Project.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Project
router.get('/:id', async (req, res) => {
  try {
    // Check if owner OR has assigned tasks in this project
    const Task = require('../Models/Task');
    const hasAssignedTasks = await Task.exists({ project: req.params.id, assignedTo: req.user.userId });
    
    const query = { _id: req.params.id };
    if (!hasAssignedTasks) {
        query.owner = req.user.userId;
    }
    
    const project = await Project.findOne(query);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
