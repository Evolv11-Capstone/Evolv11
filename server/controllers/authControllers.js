// Import the User model to interact with the users table
const User = require('../models/User');

///////////////////////////////
// REGISTER USER
///////////////////////////////

// Controller to handle user registration
exports.registerUser = async (req, res) => {
  try {
    // Destructure incoming fields from the request body
    const { name, email, age, nationality, role, password, image_url, height, preferred_position } = req.body;

    // Validate minimum required fields for all users
    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required.' });
    }

    // Validate player-specific required fields
    if (role === 'player') {
      if (!height || !preferred_position) {
        return res.status(400).send({ message: 'Height and preferred position are required for players.' });
      }
      if (!image_url) {
        return res.status(400).send({ message: 'Player image is required.' });
      }
    }

    // Create user with image_url (even if it's undefined for non-players)
    const user = await User.create({
      name,
      email,
      age,
      nationality,
      role,
      password,
      height,
      preferred_position,
      image_url: image_url || null, // fallback to null if not provided
      created_at: new Date() // Set current time as created_at
    });

    //  Store session for persistent login
    req.session.userId = user.id;
    req.session.role = user.role;

    //  Return the created user and success flag to the frontend
    res.send({ success: true, user });

  } catch (err) {
    // Handle unique email constraint
    if (err.code === '23505' && err.detail.includes('email')) {
      return res.status(409).send({ message: 'Email already exists.' });
    }

    // Log unexpected errors
    console.error('Registration failed:', err);
    res.status(500).send({ message: 'Server error during registration.' });
  }
};


///////////////////////////////
// LOGIN USER
///////////////////////////////

// Controller to handle login of existing users
exports.loginUser = async (req, res) => {
  // Make sure the request body exists
  if (!req.body) {
    return res.status(400).send({ message: 'Request body is missing.' });
  }

  // Extract login credentials from body
  const { email, password } = req.body;

  // Validate input format
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password required.' });
  }

  try {
    // Attempt to find a user by the provided email
    const user = await User.findByEmail(email);

    // If no user found, return not found error
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Use User model method to verify password validity
    const isPasswordValid = await user.isValidPassword(password);

    // If password is invalid, return 401 Unauthorized
    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Invalid credentials.' });
    }

    // If login successful, store user ID in session
    req.session.userId = user.id;

    // Also store the user's role for downstream logic (e.g., my_teams route)
    req.session.role = user.role;

    // Return the user and success flag so frontend can update global state
    res.send({ success: true, user });

  } catch (err) {
    // Catch and log unexpected server-side errors
    console.error('Login failed:', err);
    res.status(500).send({ message: 'Failed to login.' });
  }
};

///////////////////////////////
// SHOW CURRENT USER
///////////////////////////////

// Controller to check if user is authenticated and return session user
exports.showMe = async (req, res) => {
  // If session does not contain a user ID, the user is not logged in
  if (!req.session.userId) {
    return res.status(401).send({ message: 'User must be authenticated.' });
  }

  try {
    // Fetch full user object using the ID from the session
    const user = await User.find(req.session.userId);

    // Return the user object to the frontend
    res.send({ success: true, user });

  } catch (err) {
    // Log any unexpected issues with session-based lookup
    console.error('Failed to fetch user from session:', err);
    res.status(500).send({ message: 'Failed to retrieve user info.' });
  }
};

///////////////////////////////
// LOGOUT USER
///////////////////////////////

// Controller to end the session (logout)
exports.logoutUser = (req, res) => {
  // Destroy the session object by setting it to null
  req.session = null;

  // Respond with 204 No Content to confirm logout success
  res.status(204).send({ message: 'User logged out.' });
};
