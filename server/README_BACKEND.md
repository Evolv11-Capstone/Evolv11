# Evolv11 Backend Documentation

## Tech Stack
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Query Builder:** Knex.js
- **Authentication:** Cookie-based sessions using `cookie-session`
- **Environment Variables:** Managed with `dotenv`

---

## Folder Structure

```
server/
│
├── controllers/
│   ├── authControllers.js         // Register, login, logout, current user
│   ├── userControllers.js         // View and update user info
│   ├── teamControllers.js         // Create and list teams
│   └── teamRequestControllers.js  // Handle team join requests
│
├── middleware/
│   ├── checkAuthentication.js     // Middleware to ensure user is authenticated
│   ├── handleCookieSessions.js    // Middleware to initialize session cookies
│   ├── logErrors.js               // Middleware to log errors
│   └── logRoutes.js               // Middleware to log route access
│
├── models/
│   ├── User.js                    // User model logic (create, find, update, list)
│   ├── Team.js                    // Team model logic (create, list)
│   └── TeamRequest.js             // Join team request logic
│
├── db/
│   └── knex.js                    // Knex instance and configuration
│
├── knexfile.js                    // Environment-specific database configs
├── index.js                       // Main server file (entry point)
└── .env                           // Environment variables (PG_PASS, SESSION_SECRET, etc.)
```

---

## Authentication Endpoints

### POST `/api/auth/register`
- Registers a new user with a username and password.
- Hashes the password before storing.
- Saves the user ID in the session.

### POST `/api/auth/login`
- Authenticates user credentials.
- Validates the hashed password.
- Stores user ID in session cookie on success.

### GET `/api/auth/me`
- Returns the authenticated user's information.
- Requires an active session.

### DELETE `/api/auth/logout`
- Logs the user out by clearing the session cookie.

---

## User Endpoints

### GET `/api/users`
- Returns all users.
- Requires authentication.

### GET `/api/users/:id`
- Returns details of a single user by ID.
- Requires authentication.

### PATCH `/api/users/:id`
- Allows a user to update their username.
- Only the user themselves can make the update.

---

## Team Endpoints

### POST `/api/teams`
- Allows a coach to create a team.
- Requires a team name and the coach's user ID.

### GET `/api/teams`
- Returns all teams.

---

## Team Request Endpoints

### POST `/api/team_requests`
- Allows a player or coach to request to join a team.
- Requires `user_id`, `team_id`, and `role`.

---

## Middleware Summary

- `checkAuthentication`: Protects routes by ensuring a valid session exists.
- `handleCookieSessions`: Enables session management via secure cookies.
- `logRoutes`: Logs each route accessed and method used.
- `logErrors`: Logs errors encountered in the app lifecycle.

---

## Common User Flow

1. User registers or logs in.
2. Session is stored via cookie (`req.session.userId`).
3. If user is a coach:
   - They can create a new team.
4. If user is a player:
   - They can view existing teams and send a join request.
5. Backend verifies permissions and processes team requests accordingly.

---

## Required Environment Variables

Your `.env` file should include the following:
```
PG_PASS=your_postgres_password
SESSION_SECRET=random_secure_session_string
```
