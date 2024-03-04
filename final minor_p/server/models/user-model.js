import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false }
}, { timestamps: true })

userSchema.methods.verifyPassword = async function (x) {
  // try 
  return await bcrypt.compare(x, this.password)
  // catch
}

userSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 10)

  next()
})

const User = mongoose.model('User', userSchema)
export default User