# CollabZen – Smart Team Management Platform

## 🚀 Hosted Links
- **Frontend:** [https://collabzen-frontend.vercel.app](https://collabzen-frontend.vercel.app) (Placeholder)
- **Backend:** [https://collabzen-api.onrender.com](https://collabzen-api.onrender.com) (Placeholder)

## 📝 Problem Statement
CollabZen addresses the need for a streamlined, efficient team management platform. It allows teams to manage projects and tasks with ease, offering features like real-time updates, task assignment, and progress tracking, solving the chaos of scattered communication and unorganized workflows.

## 🏗 System Architecture
CollabZen is built on a **MERN Stack** architecture:
- **Frontend:** React (Vite) for a dynamic and responsive user interface.
- **Backend:** Express.js & Node.js for a robust REST API.
- **Database:** MongoDB Atlas for flexible and scalable data storage.
- **Authentication:** JWT (JSON Web Tokens) for secure user sessions.

## 💻 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React, Vite, Axios, Vanilla CSS (Glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT, Bcrypt |
| Deployment | Vercel (Frontend), Render (Backend) |

## 🔌 API Route Documentation

### Projects
- `POST /projects` - Create a new project
- `GET /projects` - Get all projects (Supports pagination, search, sort)
- `GET /projects/:id` - Get a specific project
- `PUT /projects/:id` - Update a project
- `DELETE /projects/:id` - Delete a project

### Tasks
- `POST /tasks` - Create a new task
- `GET /tasks` - Get tasks (Supports pagination, search, sort, filter)
- `GET /tasks/:id` - Get a specific task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Auth
- `POST /signup` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile

## 🔍 Pagination, Sorting, & Filtering Examples

### Pagination
`GET /tasks?page=1&limit=5`

### Sorting
`GET /tasks?sort=deadline:asc` (Sort by deadline ascending)
`GET /projects?sort=createdAt:desc` (Sort by newest first)

### Filtering
`GET /tasks?status=in-progress&priority=high`
`GET /tasks?projectId=12345`

### Searching
`GET /projects?search=Marketing`

## 🛠 Setup Instructions

### Backend
1. Navigate to `backend` folder.
2. Install dependencies: `npm install`
3. Create `.env` file (see below).
4. Run server: `npm run dev`

### Frontend
1. Navigate to `vite-project` folder.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## 🔑 Environment Variable Guide

### Backend (.env)
```
PORT=8080
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collabzen
JWT_SECRET=your_super_secret_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
```

## 📄 Proposal Section
(As per PDF requirements, this project implements the core features of CollabZen including Project Management, Task Tracking, and User Authentication.)

## 📸 Screenshots
![Dashboard](placeholder-dashboard.png)
![Project Details](placeholder-project.png)
