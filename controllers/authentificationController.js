const { promisify } = require('util');
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
    passwordChangedAt: req.body.passwordChangedAt,
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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppErrorHandler('You are not logged in! Pls log to gain access!', 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, secretKey);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppErrorHandler('The user belonging to this token doesnt exist', 401)
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppErrorHandler(
        'User recently changed password! Pls log in again',
        401
      )
    );
  }
  // Grant access to protected route
  req.user = currentUser;
  next();
});
