'use strict';

module.exports = function (AppUser) {
  // Function to validat birth month
  function birthMonthValidator(err) {
    if (this.birthMonth && (this.birthMonth < 1 || this.birthMonth > 12)) err();
  }
  AppUser.validate('birthMonth', birthMonthValidator, { message: 'Invalid birth month' });

  // Function to validat birth date  
  function birthDateValidator(err) {
    if (this.birthDate && (this.birthDate < 1 || this.birthDate > 31)) err();
  }
  AppUser.validate('birthDate', birthDateValidator, { message: 'Invalid birth date' });

  // Function to validat birth year    
  function birthYearValidator(err) {
    if (this.birthYear && this.birthYear < 1) err();
  }
  AppUser.validate('birthYear', birthYearValidator, { message: 'Invalid birth year' });

  // Function to validate zipcode
  function zipValidator(err) {
    if (this.zip && this.zip.toString().length > 5) err();
  }
  AppUser.validate('zip', zipValidator, { message: 'Invalid zip' });

  // Validate state length to 2
  AppUser.validatesLengthOf('state', { min: 2, max: 2 }, {message: 'Must be of size 2!'});
};
