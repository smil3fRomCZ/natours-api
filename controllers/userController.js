const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');
const AppErrorHandler = require('../utils/appErrorHandler');

const filterObject = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) {
      newObject[element] = object[element];
    }
  });
  return newObject;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  // 1) Create an error if user posts password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppErrorHandler(
        'This route is not for password updates, pls use /update-password',
        400
      )
    );
  }
  // 2) update user document
  const filteredBody = filterObject(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not yet defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not yet defined',
  });
};
