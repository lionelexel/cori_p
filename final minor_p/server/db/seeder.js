// Packages
import dotenv from 'dotenv'
import chalk from 'chalk'

// Temp_Data
import users from '../temp_data/users.js'
import products from '../temp_data/products.js'

// Models
import User from '../models/user-model.js'
import Product from '../models/product-model.js'
import Order from '../models/order-model.js'

// DB Connection
import connectToDB from './index.js'

// Script Config
dotenv.config()
connectToDB()

// Functions
const seedDB = async () => {
  try {
    await User.deleteMany()
    await Product.deleteMany()
    await Order.deleteMany()

    const createdUsers = await User.insertMany(users)
    const adminUser = createdUsers[0]._id

    const sampleProducts = products.map(product => {
      return { ...product, user: adminUser }
    })

    await Product.insertMany(sampleProducts)
    console.log(chalk.green.inverse('Data seeded successfully! Now exiting script...'))
    process.exit()
  }

  catch (e) {
    console.error(chalk.red.inverse('Error seeding the DB: ' + e))
    process.exit(1)
  }
}

const clearDB = async () => {
  try {
    await User.deleteMany()
    await Product.deleteMany()
    await Order.deleteMany()

    console.log(chalk.green.inverse('Data deleted successfully! Now exiting script...'))
    process.exit()
  }

  catch (e) {
    console.error(chalk.red.inverse('Error clearing the DB: ' + e))
    process.exit(1)
  }
}

// Command Line Args
if (process.argv[2] === '-D') {
  clearDB()
} else {
  seedDB()
}
