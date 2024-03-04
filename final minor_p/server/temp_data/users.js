import bcrypt from 'bcryptjs'

const users = [
  {
    name: 'Mckenzie Irwin',
    email: 'irwinmck@gmail.com',
    password: bcrypt.hashSync('123', 10),
    isAdmin: true
  },
  {
    name: 'Test User',
    email: 'test.user@example.com',
    password: bcrypt.hashSync('123', 10),
  },
]

export default users