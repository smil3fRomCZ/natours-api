const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const morgan = require('morgan');
const AppError = require('./utils/appErrorHandler');
const globalErrorHandler = require('./controllers/errorController');

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

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
