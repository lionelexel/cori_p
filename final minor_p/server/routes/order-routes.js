import express from 'express'
import asyncHandler from 'express-async-handler'
const router = express.Router()

import { authenticate, isAdmin } from '../middleware/auth.js'
import Order from '../models/order-model.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/orders', authenticate, asyncHandler(async (req, res) => {
  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  } = req.body

  if (!cartItems || cartItems.length === 0) {
    res.status(400)
    throw new Error('No items in order.')
  }

  const order = new Order({
    user: req.user._id,
    orderItems: cartItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  })

  const createdOrder = await order.save()
  res.status(201).json(createdOrder)
}))

// @desc    Get logged in user's orders
// @route   GET /api/orders
// @access  Private
router.get('/orders', authenticate, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
  res.json(orders)
}))

// @desc    Get logged in user's orders
// @route   GET /api/orders
// @access  Private
router.get('/orders/all', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email')
  res.json(orders)
}))

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/orders/:id', authenticate, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')

  if (!order) {
    res.status(404)
    throw new Error(`Order '${req.params.id}' not found.`)
  }

  res.json(order)
}))

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/orders/:id/pay', authenticate, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(404)
    throw new Error(`Order '${req.params.id}' not found.`)
  }

  order.isPaid = true
  order.paidAt = Date.now()
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address
  }

  const updatedOrder = await order.save()
  res.json(updatedOrder)
}))

export default router