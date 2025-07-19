///////////////////////////////
// Imports
///////////////////////////////

require('dotenv').config(); 
// Load environment variables from .env (DB config, session secret, etc.)

const path = require('path'); 
// Native Node module for resolving file paths

const express = require('express'); 
// Import Express web framework

const cors = require('cors'); 
// CORS middleware to allow frontend to access backend with cookies

const session = require('express-session'); 
// Server-side session management (replaces cookie-session)

const app = express(); 
// Initialize the Express app


///////////////////////////////
// Middleware: Session & CORS
///////////////////////////////

// CORS setup to allow requests from your Expo frontend
app.use(cors({
  origin: 'http://192.168.1.202:8081', // Expo dev server's origin
  credentials: true // Allow cookies to be sent/received from frontend
}));

// Session setup with express-session
app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

///////////////////////////////
// Custom Middleware
///////////////////////////////

const checkAuthentication = require('./middleware/checkAuthentication');
const logRoutes = require('./middleware/logRoutes');
const logErrors = require('./middleware/logErrors');

// Log every request (method + route)
app.use(logRoutes);

// Allow Express to parse JSON request bodies
app.use(express.json());

///////////////////////////////
// Static Assets
///////////////////////////////

// Serve static frontend files (if using a built frontend)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

///////////////////////////////
// Route Imports
///////////////////////////////

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerTeamRequestRoutes = require('./routes/playerTeamRequestRoutes');
const coachTeamRequestRoutes = require('./routes/coachTeamRequestRoutes');
const myTeamRoutes = require('./routes/myTeamRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const playerRoutes = require('./routes/playerRoutes'); // Player-specific routes

///////////////////////////////
// Route Mounting
///////////////////////////////

// Auth (login, register, session check)
app.use('/api/auth', authRoutes);

// Users (authenticated)
app.use('/api/users', checkAuthentication, userRoutes);

// Teams (create, list)
app.use('/api/teams', checkAuthentication, teamRoutes);

// Team join requests
app.use('/api/player_team_requests', checkAuthentication, playerTeamRequestRoutes);
app.use('/api/coach_team_requests', checkAuthentication, coachTeamRequestRoutes);

// Get all teams a user is part of
app.use('/api/my_teams', checkAuthentication, myTeamRoutes);

// File uploads (e.g. player images)
app.use('/api/uploads', uploadRoutes);

// Player-specific routes (fetch player details, upload images)
app.use('/api/players', playerRoutes); // Player-specific routes

///////////////////////////////
// Fallback for React Router
///////////////////////////////

// Catch-all: serve frontend index.html if no API route matches
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

///////////////////////////////
// Error Logging Middleware
///////////////////////////////

app.use(logErrors);

///////////////////////////////
// Server Startup
///////////////////////////////

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}/`);
});
