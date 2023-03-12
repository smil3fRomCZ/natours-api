const reviewRouter = require('express').Router();
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authentificationController');

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = reviewRouter;
