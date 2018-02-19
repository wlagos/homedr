'use strict';

const StateLists = require('../states');

module.exports = function (Booking) {
  // Function to validate zipcode
  function zipValidator(err) {
    if (this.zip && this.zip.toString().length > 5) err();
  }
  Booking.validate('zip', zipValidator, { message: 'Invalid zip' });

  // Validate state length to 2
  Booking.validatesLengthOf('state', { min: 2, max: 2 });

  // Validate state from state list
  Booking.validatesInclusionOf('state', { in: StateLists, message: 'Invalid state!' });
};
