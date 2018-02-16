'use strict';

module.exports = function (Booking) {
  // Function to validate zipcode
  function zipValidator(err) {
    if (this.zip && this.zip.toString().length > 5) err();
  }
  Booking.validate('zip', zipValidator, { message: 'Invalid zip' });
};
