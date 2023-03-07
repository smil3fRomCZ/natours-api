const userRouter = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authentificationController');

userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);
userRouter.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

userRouter.patch(
  '/update-current-user',
  authController.protect,
  userController.updateCurrentUser
);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
