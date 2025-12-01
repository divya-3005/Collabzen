const express = require("express");
const router = express.Router();
const prisma = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

// CREATE task
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description, projectId } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    });

    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.ownerId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: Number(projectId),
      },
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tasks for a project
router.get("/project/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.ownerId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, status } = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await prisma.project.findUnique({
      where: { id: task.projectId }
    });

    if (project.ownerId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const project = await prisma.project.findUnique({
      where: { id: task.projectId }
    });

    if (project.ownerId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
