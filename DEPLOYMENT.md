# 🚀 Deployment Instructions

## 1. MongoDB Atlas (Database)
1. Create a cluster on MongoDB Atlas.
2. Create a database user (username/password).
3. Whitelist IP (0.0.0.0/0 for access from anywhere).
4. Get Connection String: `mongodb+srv://<user>:<password>@cluster.mongodb.net/collabzen`.

## 2. Render (Backend)
1. Push code to GitHub.
2. Create new Web Service on Render.
3. Connect GitHub repo.
4. Root Directory: `backend`.
5. Build Command: `npm install`.
6. Start Command: `node index.js`.
7. **Environment Variables**:
    - `MONGO_URI`: (Your Atlas connection string)
    - `JWT_SECRET`: (Your secret)
    - `PORT`: `8080` (or leave default)

## 3. Vercel (Frontend)
1. Push code to GitHub.
2. Create new Project on Vercel.
3. Connect GitHub repo.
4. Root Directory: `vite-project`.
5. Framework Preset: Vite.
6. **Environment Variables**:
    - `VITE_API_URL`: (Your Render Backend URL, e.g., `https://collabzen-api.onrender.com`)
7. Deploy.
