const AppErrorHandler = require('../utils/appErrorHandler');

// Specific Error handlers function
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErrorHandler(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppErrorHandler(message, 400);
};
//
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppErrorHandler(message, 400);
};

const handleJwtError = () =>
  new AppErrorHandler('Invalid token, pls login again', 401);

const handleJwtExpirationError = () =>
  new AppErrorHandler('Your token expired! Pls log in again', 401);

// Format DEV errors
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Format PROD errors
const sendErrorProduction = (err, res) => {
  // Operational error - trusted error sending to client
  if (err.isOperational) {
    res.sendStatus(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming or unknown error
    // eslint-disable-next-line no-console
    console.log(err);
    // Send generic error
    res.sendStatus(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    error.name = err.name;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpirationError();
    sendErrorProduction(error, res);
  }
};
