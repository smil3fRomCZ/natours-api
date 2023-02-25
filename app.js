const express = require('express');
const morgan = require('morgan');

const userRouter = require('./routes/userRouter');
const tourRouter = require('./routes/tourRouter');

const app = express();

// Middlewares
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
