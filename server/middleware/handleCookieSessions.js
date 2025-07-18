// middleware/handleCookieSessions.js
const session = require('express-session');

const handleCookieSessions = session({
  name: 'session', // cookie name
  secret: process.env.SESSION_SECRET, // stored in .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  }
});

module.exports = handleCookieSessions;
