/* eslint-disable */
import axios from 'axios';
const Stripe = require('stripe');
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const stripe = Stripe(
      'pk_test_BUkd0ZXAj6m0q0jMyRgBxNns00PPtgvjjrpk_test_51NsoKdGuDsPZp8S0qdlvjAPrilAvfDcPi6P6EquJMvpzBUB51MqDXKwF8WdnpRGCW8CXXRc1pRGdJ7ZDsnkaVQDH00RfUrzOnk',
    );
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + chanre credit card
    window.location.assign(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
