// Import the User model to interact with the database
const User = require('../models/User');

///////////////////////////////
// GET /api/users
// Returns an array of all users
///////////////////////////////
exports.listUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.list();

    // Return the list of users as JSON
    res.send(users);
  } catch (err) {
    console.error('Failed to list users:', err);
    res.status(500).send({ message: 'Could not retrieve users.' });
  }
};

///////////////////////////////
// GET /api/users/:id
// Returns a single user by ID
///////////////////////////////
exports.showUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Attempt to find user with the given ID
    const user = await User.find(id);

    // If user not found, return 404
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Return the user data
    res.send(user);
  } catch (err) {
    console.error(`Failed to fetch user with id ${id}:`, err);
    res.status(500).send({ message: 'Could not fetch user.' });
  }
};

///////////////////////////////
// PATCH /api/users/:id
// Update an authenticated user's profile (name or email, etc.)
///////////////////////////////
exports.updateUser = async (req, res) => {
  const userToModify = Number(req.params.id);               // ID of the user being modified
  const userRequestingChange = Number(req.session.userId);  // ID from session (who is logged in)

  // Ensure the user is modifying their own data
  if (userToModify !== userRequestingChange) {
    return res.status(403).send({ message: 'Unauthorized.' });
  }

  // Destructure fields allowed for update
  const { name, email, age, nationality, role, height, preferred_position } = req.body;

  // Require at least one field to be updated
  if (!name && !email && !age && !nationality && !role && !height && !preferred_position) {
    return res.status(400).send({ message: 'No valid fields provided.' });
  }

  try {
    // Attempt to update the user
    const updatedUser = await User.update(userToModify, { name, email, age, nationality, role, height, preferred_position });

    // If user not found in DB
    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Return updated user
    res.send(updatedUser);
  } catch (err) {
    console.error(`Failed to update user ${userToModify}:`, err);
    res.status(500).send({ message: 'Could not update user.' });
  }
};
