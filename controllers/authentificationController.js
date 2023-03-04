const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');

exports.signUp = catchAsync(async (req, res, next) => {
  const registrationData = req.body;
  const newUser = await User.create(registrationData);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
