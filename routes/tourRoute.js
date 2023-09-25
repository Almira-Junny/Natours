const express = require('express');
const {
  aliasTopTours,
  getAllTours,
  getTour,
  createNewTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyTourStats,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controller/tourController');
const { protect, restrictTo } = require('../controller/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// route.param('id', checkID);
router.route('/top-tours').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-stats/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMonthlyTourStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distance/:latlng/unit/:unit').get(getDistances);

router.route('/').get(protect, getAllTours).post(createNewTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
