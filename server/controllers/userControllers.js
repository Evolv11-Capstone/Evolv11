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
  const { name, email, birthday, nationality, role, height, preferred_position, image_url } = req.body;

  // Debug: Log the received data
  console.log('Update request data:', { name, email, birthday, nationality, role, height, preferred_position, image_url });

  try {
    // Filter out undefined, null, and empty string values before updating
    const updateData = {};
    if (name !== undefined && name !== null && name !== '') updateData.name = name;
    if (email !== undefined && email !== null && email !== '') updateData.email = email;
    if (birthday !== undefined && birthday !== null && birthday !== '') updateData.birthday = birthday;
    if (nationality !== undefined && nationality !== null && nationality !== '') updateData.nationality = nationality;
    if (role !== undefined && role !== null && role !== '') updateData.role = role;
    if (height !== undefined && height !== null && height !== '') updateData.height = height;
    if (preferred_position !== undefined && preferred_position !== null && preferred_position !== '') updateData.preferred_position = preferred_position;
    if (image_url !== undefined && image_url !== null) updateData.image_url = image_url; // Allow empty string for image_url to clear it

    console.log('Filtered update data:', updateData);

    // Check if we have any valid fields to update after filtering
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ message: 'No valid fields provided for update.' });
    }

    // Attempt to update the user
    const updatedUser = await User.update(userToModify, updateData);

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

///////////////////////////////
// PATCH /api/users/:id/password
// Update an authenticated user's password (requires current password)
///////////////////////////////
exports.updatePassword = async (req, res) => {
  const userToModify = Number(req.params.id);               // ID of the user being modified
  const userRequestingChange = Number(req.session.userId);  // ID from session (who is logged in)

  // Ensure the user is modifying their own data
  if (userToModify !== userRequestingChange) {
    return res.status(403).send({ message: 'Unauthorized.' });
  }

  const { currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!currentPassword || !newPassword) {
    return res.status(400).send({ message: 'Current password and new password are required.' });
  }

  // Validate new password strength (optional)
  if (newPassword.length < 6) {
    return res.status(400).send({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    // First, fetch the user to verify current password
    const user = await User.find(userToModify);
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.isValidPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).send({ message: 'Current password is incorrect.' });
    }

    // Update password using the User model's updatePassword method
    const success = await User.updatePassword(userToModify, newPassword);
    
    if (!success) {
      return res.status(500).send({ message: 'Failed to update password.' });
    }

    res.send({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error(`Failed to update password for user ${userToModify}:`, err);
    res.status(500).send({ message: 'Could not update password.' });
  }
};
