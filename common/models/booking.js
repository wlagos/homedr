'use strict';

module.exports = function (Booking) {
  // Function to validate zipcode
  function zipValidator(err) {
    if (this.zip && this.zip.toString().length > 5) err();
  }
  Booking.validate('zip', zipValidator, { message: 'Invalid zip' });

  // Validate state length to 2
  Booking.validatesLengthOf('state', { min: 2, max: 2 }, {message: 'Must be of size 2!'});
};
