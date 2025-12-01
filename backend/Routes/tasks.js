const express = require('express');
const router = express.Router();
const Task = require('../Models/Task');
const Project = require('../Models/Project');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);

// Create Task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, deadline, projectId } = req.body;
    
    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, owner: req.user.userId });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const taskData = {
      title,
      description,
      status,
      priority,
      deadline,
      project: projectId,
      assignedTo: req.body.assignedTo || req.user.userId
    };

    // If assignedTo is explicitly empty string (from frontend select), default to current user or null
    if (req.body.assignedTo === "") {
        taskData.assignedTo = req.user.userId;
    }

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Tasks (Search, Sort, Filter, Pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort, projectId, status, priority } = req.query;
    
    // Base query: find tasks where the project belongs to the user
    // First find all user projects
    const userProjects = await Project.find({ owner: req.user.userId }).select('_id');
    const userProjectIds = userProjects.map(p => p._id);

    const query = { project: { $in: userProjectIds } };

    if (projectId) {
        // Ensure the requested projectId is one of the user's projects
        if (userProjectIds.some(id => id.toString() === projectId)) {
            query.project = projectId;
        } else {
            return res.json({ tasks: [], totalPages: 0, currentPage: page });
        }
    }

    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let sortOption = { createdAt: -1 };
    if (sort) {
        if (sort === 'deadline') sortOption = { deadline: 1 };
        else if (sort === 'priority') sortOption = { priority: -1 }; 
        else if (sort === 'createdAt') sortOption = { createdAt: -1 };
    }

    const tasks = await Task.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('project', 'name');

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Verify ownership via project
    const project = await Project.findOne({ _id: task.project._id, owner: req.user.userId });
    if (!project) return res.status(403).json({ error: 'Access denied' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Task
router.put('/:id', async (req, res) => {
  try {
    // First verify ownership
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findOne({ _id: task.project._id, owner: req.user.userId });
    if (!project) return res.status(403).json({ error: 'Access denied' });

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const project = await Project.findOne({ _id: task.project._id, owner: req.user.userId });
    if (!project) return res.status(403).json({ error: 'Access denied' });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
