require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

///////////////////////////////
// Middleware: Session & CORS
///////////////////////////////

app.use(cors({
  origin: 'http://192.168.1.202:8081', // Replace with Expo LAN/tunnel URL as needed
  credentials: true
}));

app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true in production
    maxAge: 1000 * 60 * 60 * 24
  }
}));

///////////////////////////////
// Custom Middleware
///////////////////////////////

const checkAuthentication = require('./middleware/checkAuthentication');
const logRoutes = require('./middleware/logRoutes');
const logErrors = require('./middleware/logErrors');

app.use(logRoutes);
app.use(express.json());

///////////////////////////////
// Static Frontend Assets
///////////////////////////////

app.use(express.static(path.join(__dirname, '../frontend/dist')));

///////////////////////////////
// Route Imports
///////////////////////////////

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes'); // ✅ now includes GET /:id/players
const playerTeamRequestRoutes = require('./routes/playerTeamRequestRoutes');
const coachTeamRequestRoutes = require('./routes/coachTeamRequestRoutes');
const myTeamRoutes = require('./routes/myTeamRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const lineupRoutes = require('./routes/lineupRoutes');

///////////////////////////////
// Route Mounting
///////////////////////////////

// Public auth endpoints
app.use('/api/auth', authRoutes);

// Authenticated user & data access
app.use('/api/users', checkAuthentication, userRoutes);
app.use('/api/teams', checkAuthentication, teamRoutes); // ✅ includes /api/teams/:id/players
app.use('/api/player_team_requests', checkAuthentication, playerTeamRequestRoutes);
app.use('/api/coach_team_requests', checkAuthentication, coachTeamRequestRoutes);
app.use('/api/my_teams', checkAuthentication, myTeamRoutes);

// match management
app.use('/api/matches', matchRoutes);

// Lineup management
app.use('/api/lineups', lineupRoutes);

// Public endpoints
app.use('/api/uploads', uploadRoutes);
app.use('/api/players', playerRoutes); // includes GET /api/players/:playerId

///////////////////////////////
// React Frontend Fallback
///////////////////////////////

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

///////////////////////////////
// Global Error Logger
///////////////////////////////

app.use(logErrors);

///////////////////////////////
// Start Server
///////////////////////////////

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}/`);
});
