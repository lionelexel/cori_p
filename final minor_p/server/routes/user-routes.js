import express from 'express'
import asyncHandler from 'express-async-handler'
const router = express.Router()

import User from '../models/user-model.js'
import { generateToken } from '../utils/helpers.js'
import { authenticate, isAdmin } from '../middleware/auth.js'

// @desc    Registers a new user and returns a token
// @route   POST /api/users
// @access  Public
router.post('/users', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body
  const user = await User.findOne({ email })

  if (user) {
    res.status(400)
    throw new Error('Account already exists.')
  }

  // Create new user
  const newUser = await new User({ name, email, password }).save()

  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    isAdmin: newUser.isAdmin,
    token: generateToken(newUser._id)
  })

}))

// @desc    Auths a user and returns a token
// @route   POST /api/users/login
// @access  Public
router.post('/users/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (user && await user.verifyPassword(password)) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    })
  }

  res.status(401)
  throw new Error('Invalid email or password.')
}))

// @desc    Gets users profile
// @route   GET /api/users/profile
// @access  Private
router.get('/users/profile', authenticate, asyncHandler(async (req, res) => {
  res.json(req.user)
}))

// @desc    Updates a user's profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/users/profile', authenticate, asyncHandler(async (req, res) => {
  const user = req.user

  user.name = req.body.name || user.name
  user.email = req.body.email || user.email
  if (req.body.password)
    user.password = req.body.password

  const updatedUser = await user.save()

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    token: generateToken(updatedUser._id)
  })
}))

/*******************************************************************************
 * ADMIN ROUTES
 ******************************************************************************/

// @desc    Gets all user's profiles
// @route   GET /api/users
// @access  Admin
router.get('/users', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const users = await User.find()
  res.json(users)
}))

// @desc    Gets a specific user by id
// @route   GET /api/users/:id
// @access  Admin
router.get('/users/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error(`User ${req.params.id} not found.`)
  }
}))

// @desc    Update a specific user by id
// @route   PUT /api/users/:id
// @access  Admin
router.put('/users/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error(`User ${req.params.id} not found.`)
  }

  const { name, email, isAdmin } = req.body
  user.name = name || user.name
  user.email = email || user.email
  user.isAdmin = isAdmin
  const updatedUser = await user.save()

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
  })
}))

// @desc    Deletes a user by id
// @route   DELETE /api/users/:id
// @access  Admin
router.delete('/users/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const result = await User.findByIdAndDelete(req.params.id)

  if (result) {
    res.json({ message: `User ${req.params.id} deleted successfully.` })
  } else {
    res.status(404)
    throw new Error(`User ${req.params.id} not found.`)
  }

}))

export default router
