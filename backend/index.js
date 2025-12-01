const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("./db");

app.use(bodyParser.json());
app.use(cors());
const authenticateToken = require("./middleware/authenticateToken");


const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Protected route
app.get("/me", authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json(user);
});

const projectsRouter = require("./Routes/projects");
const tasksRouter = require("./Routes/tasks");

app.use("/projects", projectsRouter);
app.use("/tasks", tasksRouter);

// Analytics route
app.get("/analytics/overview", require("./middleware/authenticateToken"), async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalProjects = await prisma.project.count({
      where: { ownerId: userId },
    });

    const totalTasks = await prisma.task.count({
      where: { project: { ownerId: userId } },
    });

    const completedTasks = await prisma.task.count({
      where: { project: { ownerId: userId }, status: "done" },
    });

    res.json({ totalProjects, totalTasks, completedTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
