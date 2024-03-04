import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/user-model.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const validatedToken = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(validatedToken.userId).select('-password')
    if (user) {
      req.user = user
      next()
    } else {
      res.status(404)
      throw new Error('No user found with the provided token.')
    }
  }

  catch (e) {
    res.status(401)
    throw new Error('Invalid token.')
  }
})

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) next()
  else {
    res.status(401)
    throw new Error('Not authorized as an Admin.')
  }
})