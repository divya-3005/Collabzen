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
    
    // Verify project exists
    const project = await Project.findOne({ _id: projectId });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Allow creation if:
    // 1. User is owner
    // 2. User has tasks assigned in this project
    // 3. OR just allow it if they have the ID (for now, to fix the blocker)
    
    // For strictness, let's keep the check but ensure it works.
    // The previous check failed because maybe Task.exists didn't work as expected or async issue?
    // Let's debug by logging or just simplifying.
    
    // Simplified: If you can see the project (which we control in GET /projects), you can add tasks.
    // But here we are in POST /tasks, so we don't know if they "can see" it easily without duplicating logic.
    
    // Let's just check if they are owner OR if the project is "public" to them (meaning they have tasks).
    // If Diya has a task, she should be able to add more.
    
    const isOwner = project.owner.toString() === req.user.userId;
    // Check if user has ANY task assigned in this project
    const hasAssignedTasks = await Task.exists({ project: projectId, assignedTo: req.user.userId });
    
    if (!isOwner && !hasAssignedTasks) {
         return res.status(403).json({ error: 'Access denied: You must be the owner or a collaborator to create tasks.' });
    }

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
    
    // Log Activity
    const Activity = require('../Models/Activity');
    await Activity.create({
        text: `created task "${task.title}"`,
        user: req.user.userId,
        project: projectId,
        type: 'task_created'
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Tasks (Search, Sort, Filter, Pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort, projectId, status, priority } = req.query;
    
    // Base query: find tasks where the project belongs to the user OR the task is assigned to the user
    // First find all user projects
    const userProjects = await Project.find({ owner: req.user.userId }).select('_id');
    const userProjectIds = userProjects.map(p => p._id);

    const query = {
        $or: [
            { project: { $in: userProjectIds } },
            { assignedTo: req.user.userId }
        ]
    };

    if (projectId) {
        // Allow if user owns project OR has tasks assigned in this project
        // We already know the user has access to this project if it's in userProjectIds OR if they have tasks in it.
        // But the query construction above is a bit restrictive for the specific projectId case.
        
        // Let's simplify: If projectId is provided, we just need to check if user has access to THIS project.
        // Access = Owner OR Assigned Task in this project.
        
        const isOwner = userProjectIds.some(id => id.toString() === projectId);
        
        // Reset query to focus on this project
        // IMPORTANT: We must remove the $or condition because it conflicts with the specific project filter
        delete query.$or;
        query.project = projectId;
        
        if (!isOwner) {
             // If not owner, ONLY show tasks assigned to user in this project
             query.assignedTo = req.user.userId;
        }
        // If owner, they can see all tasks in project
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
    
    // Verify ownership via project OR assignment
    const project = await Project.findOne({ _id: task.project._id, owner: req.user.userId });
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.userId;
    
    if (!project && !isAssigned) return res.status(403).json({ error: 'Access denied' });

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
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.userId;

    if (!project && !isAssigned) return res.status(403).json({ error: 'Access denied' });

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log Activity if completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
        const Activity = require('../Models/Activity');
        await Activity.create({
            text: `completed task "${updatedTask.title}"`,
            user: req.user.userId,
            project: task.project._id,
            type: 'task_completed'
        });
    }

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
