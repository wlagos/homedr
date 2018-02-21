'use strict';

const moment = require('moment');
const StateLists = require('../states');

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
    if (this.zip && this.zip.toString().length != 5) err();
  }
  AppUser.validate('zip', zipValidator, { message: 'Invalid zip' });

  // Validate state length to 2
  AppUser.validatesLengthOf('state', { min: 2, max: 2 });

  // Validate state from state list
  AppUser.validatesInclusionOf('state', { in: StateLists, message: 'Invalid state!' });

  // Validate birthdate
  function validateBirthday(err) {
    if (!this.birthDate || !this.birthMonth || !this.birthYear) {
      return err();
    }
    let combineDate = `${this.birthDate}/${this.birthMonth}/${this.birthYear}`;
    let format = 'DD/MM/YYYY';
    if (!moment(combineDate, format).isValid()) {
      return err();
    }
    let current = moment();
    let combined = moment(combineDate, format);
    if (current.diff(combined, 'years') < 18) {
      err();
    }
  }

  // Validate birthdate
  AppUser.validate('birthDate', validateBirthday, { message: 'Invalid date!' });

  // Validate birth month
  AppUser.validate('birthMonth', validateBirthday, { message: 'Invalid month!' });

  // Validate birth year
  AppUser.validate('birthYear', validateBirthday, { message: 'Invalid year!' });
};
