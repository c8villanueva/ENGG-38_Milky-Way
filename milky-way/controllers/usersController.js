const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean()
  if (!users?.length) {
    return res.status(400).json({ message: 'No users found' })
    //return may not necessarily be needed, it is more of a safety feature, so just include it
  }
  res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const {name, email, password, roles } = req.body

  // Confirm data
  if (!name || !password || !email) {
    return res.status(400).json({ message: 'All fields are required' })
  } // if there are any other errors, the async handler should ba able to take care of it, this is mainly so that the specific message can be given on the frontend to actually help the user

  // Check for duplicate
  const duplicate = await User.findOne({ email }).lean().exec()
  if (duplicate) {
    return res.status(409).json({ message: 'User already created with that email' })
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10) // salt rounds
  
  const userObject = (!Array.isArray(roles) || !roles.length)
    ? { name, email, "password": hashedPwd }
    : { name, email, "password": hashedPwd, roles }

  // Create and store new user
  const user = await User.create(userObject)

  if (user) { //created
    res.status(201).json({ message: `New user ${name} created`})
  } else {
    res.status(400).json({ message: "Invalid user data received" })
  }
})

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, name, email, roles, password } = req.body

  // Confirm data 
  if (!id || !email || !name || !Array.isArray(roles) || !roles.length) {
      return res.status(400).json({ message: 'All fields except password are required' })
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec()

  if (!user) {
      return res.status(400).json({ message: 'User not found' })
  }

  // Check for duplicate 
  const duplicate = await User.findOne({ email }).lean().exec()
  // checks for case insensitivity

  // Allow updates to the original user 
  if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: 'Duplicate email' })
  }

  user.name = name
  user.roles = roles
  user.email = email

  if (password) {
      // Hash password 
      user.password = await bcrypt.hash(password, 10) // salt rounds 
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.email} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body

  // Confirm data
  if (!id) {
      return res.status(400).json({ message: 'User ID Required' })
  }

  // // Does the user still have assigned notes?
  // const note = await Note.findOne({ user: id }).lean().exec()
  // if (note) {
  //     return res.status(400).json({ message: 'User has assigned notes' })
  // }

  // Does the user exist to delete?
  const user = await User.findById(id).exec()

  if (!user) {
      return res.status(400).json({ message: 'User not found' })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted`
  // shows as undefined, but the user does get deleted

  res.json(reply)
})


module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser
}
