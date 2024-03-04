const routeNotFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`)
  res.status(404)
  next(err)
}

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'prod' ? null : err.stack
  })
}

export {
  routeNotFound,
  errorHandler
}
