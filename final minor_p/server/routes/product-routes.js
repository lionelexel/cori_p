import express from 'express'
import multer from 'multer'
import path from 'path'
import asyncHandler from 'express-async-handler'
const router = express.Router()

import { authenticate, isAdmin } from '../middleware/auth.js'

import Product from '../models/product-model.js'

// @desc    Returns all products
// @route   GET /api/products
// @access  Public
router.get('/products', asyncHandler(async (req, res) => {
  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i'
    }
  } : {}

  const count = await Product.countDocuments(keyword)
  const products = await Product.find(keyword).limit(pageSize).skip(pageSize * (page - 1))
  res.json({ products, page, pages: Math.ceil(count / pageSize) })
}))

// @desc    Returns top rated products
// @route   GET /api/products/top-rated
// @access  Public
router.get('/products/top-rated', asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)
  res.json(products)
}))

// @desc    Returns a single specified product
// @route   GET /api/products/:id
// @access  Public
router.get('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    res.json(product)
  } else {
    res.status(404).json({ message: 'Product not found.' })
  }
}))

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
router.post('/products', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample Name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample Brand',
    category: 'Sample Category',
    countInStock: 0,
    numReview: 0,
    description: 'Sample Description'
  })

  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
}))

// @desc    Create a reviews
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/products/:id/reviews', authenticate, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('No Product Found.')
  }

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())
  if (alreadyReviewed) {
    res.status(400)
    throw new Error('Error: You have already reviewed this product.')
  }

  const { comment, rating } = req.body
  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id
  }
  product.reviews.push(review)
  product.numReviews = product.reviews.length
  product.rating = product.reviews.reduce((acc, review) => review.rating + acc, 0) / product.numReviews

  await product.save()
  res.json({ message: 'Review successfully added.' })
}))

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
router.put('/products/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product Not Found.')
  }

  const { name, price, description, image, brand, category, countInStock } = req.body
  product.name = name
  product.price = price
  product.description = description
  product.image = image
  product.brand = brand
  product.category = category
  product.countInStock = countInStock

  const updatedProduct = await product.save()
  res.json(updatedProduct)
}))


// @desc    Deletes a specified product
// @route   DELETE /api/products/:id
// @access  Admin
router.delete('/products/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const result = await Product.findByIdAndDelete(req.params.id)

  if (result) {
    res.json({ message: `Product ${req.params.id} deleted successfully.` })
  } else {
    res.status(404)
    throw new Error(`Product ${req.params.id} not found.`)
  }
}))


/****************************
 * Multer Helpers & Routes
 ***************************/
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/
  const extname = filetypes.test(path.extname(file.originalname).toLocaleLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) return cb(null, true)
  else return cb('Images of type jpg, jpeg, & png only.')
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
})

// @desc    Uploads an image to the diskStorage
// @route   POST /api/products/:id
// @access  Admin
router.post('/products/image', upload.single('image'), (req, res) => {
  res.send(`/uploads/${req.file.filename}`)
})

export default router