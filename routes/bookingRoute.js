const express = require('express');
const { protect, restrictTo } = require('../controller/authController');
const {
  getCheckoutSession,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controller/bookingController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.get('/', getAllBookings);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
