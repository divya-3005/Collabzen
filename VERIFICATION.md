# ✅ Verification Checklist

## 1. Frontend Verification
- [ ] **Open Hosted Frontend**
- [ ] **Inspect Network Tab**: Open DevTools -> Network -> XHR/Fetch.
- [ ] **Login/Signup**: Perform login. Check for `POST /login` call. Verify 200 OK and Token in response.
- [ ] **Dashboard**: Verify `GET /projects` call. Check response contains project list.
- [ ] **Create Project**: Click "New Project". Verify `POST /projects` call.
- [ ] **View Project**: Click a project. Verify `GET /projects/:id` and `GET /tasks` calls.

## 2. Backend Verification
- [ ] **Test Endpoints**: Use Postman or Curl.
    - `POST /signup`: Create user.
    - `POST /login`: Get token.
    - `GET /projects`: Use token in Header (`Authorization: Bearer <token>`).
- [ ] **Pagination**: Test `GET /tasks?page=2&limit=2`.
- [ ] **Sorting**: Test `GET /tasks?sort=priority:desc`.
- [ ] **Filtering**: Test `GET /tasks?status=completed`.

## 3. Database Verification
- [ ] **MongoDB Atlas**: Log in to Atlas dashboard.
- [ ] **Collections**: Check for `users`, `projects`, `tasks` collections.
- [ ] **Documents**: Verify new documents appear after frontend actions.
- [ ] **Indexes**: Check `email` unique index on `users`.
