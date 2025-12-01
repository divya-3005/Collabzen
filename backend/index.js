const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const User = require("./Models/User");
const Project = require("./Models/Project");
const Task = require("./Models/Task");

// Connect to Database
connectDB();

app.use(bodyParser.json());
app.use(cors());
const authenticateToken = require("./middleware/authenticateToken");


const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
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
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Protected route
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for assignment)
app.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("username email _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const projectsRouter = require("./Routes/projects");
const tasksRouter = require("./Routes/tasks");
const commentsRouter = require("./Routes/comments");

app.use("/projects", projectsRouter);
app.use("/tasks", tasksRouter);
app.use("/comments", commentsRouter);

// Analytics route
app.get("/analytics/overview", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalProjects = await Project.countDocuments({ owner: userId });

    // Find all projects owned by user to filter tasks
    const userProjects = await Project.find({ owner: userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });

    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: "completed",
    });

    res.json({ totalProjects, totalTasks, completedTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
