import mongoose from 'mongoose'
import chalk from 'chalk'

const connectToDB = () => {
  mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
      console.log(chalk.blue('[db] Successfully connected to the database.'))
    })

    .catch(e => {
      throw new Error(e)
    })
};

mongoose.connection.on('error', e => {
  throw new Error(e)
})

export default connectToDB
