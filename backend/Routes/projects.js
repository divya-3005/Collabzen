const express = require("express");
const router = express.Router();
const prisma = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

// GET all projects
router.get("/", authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user.userId },
      include: { tasks: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE project
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.userId,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!project) return res.status(404).json({ error: "Not found" });
    if (project.ownerId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE project
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Not found" });
    if (project.ownerId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.task.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
