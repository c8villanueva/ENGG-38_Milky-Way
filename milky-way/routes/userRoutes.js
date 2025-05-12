const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')

// Allow unauthenticated access to createNewUser
router.route('/')
  .post(usersController.createNewUser) // Public route for user registration

// Apply verifyJWT middleware to all routes below this line
router.use(verifyJWT)

// Protected routes
router.route('/')
  .get(usersController.getAllUsers)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)

module.exports = router