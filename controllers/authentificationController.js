// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');
const AppErrorHandler = require('../utils/appErrorHandler');

const secretKey = process.env.JWT_SECRET;
const expiration = process.env.JWT_EXPIRES_IN;

const signToken = (id) =>
  jwt.sign({ id }, secretKey, {
    expiresIn: expiration,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const registrationData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };
  const newUser = await User.create(registrationData);
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppErrorHandler('Please provide email and password', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // const result = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErrorHandler('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
