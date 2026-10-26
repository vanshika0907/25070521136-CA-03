# StudyFlow — Student Task Manager

CA-03 Full-Stack Web Development project using React, Node.js/Express, and MongoDB.

## Submission naming
- Main folder: `25070521136`
- Frontend folder: `client`
- Backend folder: `server`
- GitHub repository: `25070521136-CA-03`

## Requirements
Install Node.js/npm and MongoDB Community Server. MongoDB Compass can be used to inspect saved records.

## Run the backend
1. Open a terminal in this folder and run:
   `cd server`
   `npm install`
2. Copy `.env.example` to `.env` inside `server`.
3. Keep the local MongoDB URI and set a private JWT secret in `.env`.
4. Run `npm run dev`.
5. Confirm the API works at `http://localhost:5000/api/health`.

## Run the frontend
Open a second terminal at the project root:
`cd client`
`npm install`
`npm run dev`
Open the local URL printed by Vite (normally `http://localhost:5173`).

## Demonstration checklist
1. Register an account, then log in.
2. Add, edit, complete, search/filter, and delete tasks.
3. Refresh to verify tasks persist.
4. In MongoDB Compass connect to `mongodb://127.0.0.1:27017` and inspect the `student_task_manager` database, `users` and `tasks` collections.

## API endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tasks` (authenticated)
- `POST /api/tasks` (authenticated)
- `PATCH /api/tasks/:id` (authenticated)
- `DELETE /api/tasks/:id` (authenticated)

Passwords are hashed before storage. Task endpoints are scoped to the logged-in user. Never upload `server/.env` or real secrets to GitHub.

This is a local development project, not a deployed public website. Test it on your own machine before submitting.
