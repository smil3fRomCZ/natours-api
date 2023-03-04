const userRouter = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authentificationController');

userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);

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
