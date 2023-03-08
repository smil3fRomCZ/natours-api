const crypto = require('crypto');
const { promisify } = require('util');
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');
const AppErrorHandler = require('../utils/appErrorHandler');
const sendEmail = require('../utils/emailHandler');

const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRATION = process.env.JWT_EXPIRES_IN;
const COOKIE_EXPIRATION = process.env.JWT_COOKIE_EXPIRES_IN;

const signToken = (id) =>
  jwt.sign({ id }, SECRET_KEY, {
    expiresIn: EXPIRATION,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + COOKIE_EXPIRATION * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const registrationData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  };
  const newUser = await User.create(registrationData);
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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
  const decoded = await promisify(jwt.verify)(token, SECRET_KEY);

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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is an array of arguments
    if (!roles.includes(req.user.role)) {
      return next(
        new AppErrorHandler(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppErrorHandler('There is no user with email address', 404)
    );
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send token via email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didnt forget your pasword, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password - 10 minutes valid',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppErrorHandler(
        'There was an error sending email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppErrorHandler('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.password = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateModifiedOnly: true });

  // 3) Update changePasswordAt proporty for user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from a collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppErrorHandler('Current password is wrong', 401));
  }
  // 3) If so, then update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
  // 4) Log user in, sent JWT
  createSendToken(user, 200, res);
});
