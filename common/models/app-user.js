'use strict';

const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const StateLists = require('../states');

const ROLES = ['PATIENT', 'DISPATCHER', 'PROVIDER', 'ADMIN'];

function createError(code, message) {
  let errorObj = new Error(message);
  errorObj.statusCode = code || 400;
  return errorObj;
}

// Assign Role Function
function assignRole(data, options, cb) {
  const AppUser = this;
  const Role = this.app.models.Role;
  const RoleMapping = this.app.models.RoleMapping;

  if (!data.userId) {
    return cb(createError(403, 'Missing user id.'));
  }
  if (!data.role) {
    return cb(createError(403, 'Missing role.'));
  }
  if (!_.includes(ROLES, data.role)) {
    return cb(createError(403, 'Invalid role.'));
  }

  let roleInstance, roleMappingInstance;

  // Get Role Function
  const getRole = async () => {
    let filter = {
      where: {
        name: data.role
      }
    }
    try {
      roleInstance = await Role.findOne(filter, options);
      if (!roleInstance) {
        return cb(createError(404, 'Role not found!'));
      }
    } catch (error) {
      console.error('ERROR > GETTING ROLE > ', error);
      return cb(error);
    }
  }

  const getRolMapping = async () => {
    let filter = {
      where: {
        principalId: data.userId,
        principalType: RoleMapping.USER
      }
    }

    try {
      roleMappingInstance = await RoleMapping.findOne(filter, options);
    } catch (error) {
      console.error('ERROR > GETTING ROLE MAPPING > ', error);
      return cb(error);
    }
  }

  const assignNewRole = async () => {
    if (roleMappingInstance) {
      try {
        let updatedInstance = await roleMappingInstance.updateAttribute('roleId', roleInstance.id, options);
      } catch (error) {
        console.error('ERROR > GETTING ROLE MAPPING > ', error);
        return cb(error);
      }
    } else {
      let createData = {
        principalId: data.userId,
        roleId: roleInstance.id,
        principalType: RoleMapping.USER
      }
      try {
        let instance = await RoleMapping.create(createData, options);
      } catch (error) {
        console.error('ERROR > CREATING ROLE MAPPING > ', error);
        return cb(error);
      }
    }
  }
  async function _assignRole() {
    await getRole();
    await getRolMapping();
    await assignNewRole();
    cb(null, {
      statusCode: 200,
      meessage: 'Role successfully assigned to user!'
    })
  }
  _assignRole();
}

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
      return;
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

  // Last Login Date
  AppUser.afterRemote('login', (ctx, instance, next) => {
    next();
    let userId = instance.userId;

    const setLoginDate = async () => {
      try {
        let userInstance = await AppUser.findById(userId.toString());
        let updatedInstance = await userInstance.updateAttribute('lastLoginDate', moment().toISOString());
      } catch (error) {
        console.error('ERROR > SAVING LOGIN DATE > ', error);
      }
    }

    setLoginDate();
  });

  // Custom APU to assign role to user
  AppUser.assignRole = assignRole;
  AppUser.remoteMethod('assignRole', {
    accepts: [
      { arg: 'data', type: 'object', require: true, http: { source: 'body' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' }
    ],
    http: {
      verb: 'POST',
      path: '/assignRole'
    },
    returns: { arg: 'data', type: 'object', root: true }
  });

  // Hook to send registration email
  AppUser.afterRemote('create', function (ctx, user, next) {
    if (user.emailVerified) {
      return next();
    }
    let options = {
      host: process.env.VERIFICATION_HOST,
      port: 80,
      type: 'email',
      to: user.email,
      from: process.env.SMTP_FROM,
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    const verifyUser = async () => {
      try {
        let userVerification = await user.verify(options);
        next();
      } catch (err) {
        AppUser.deleteById(user.id);
        return next(err)
      }
    }

    verifyUser();
  });

  AppUser.afterRemote('prototype.verify', function (ctx, user, next) {
    ctx.res.render('response', {
      title: 'A Link to reverify your identity has been sent ' +
        'to your email successfully',
      content: 'Please check your email and click on the verification link ' +
        'before logging in',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  AppUser.on('resetPasswordRequest', function (info) {
    const url = `${process.env.APP_URL}/reset-password?access_token=${info.accessToken.id}`;
    const html = `Click <a href="${url}">here</a> to reset your password`;

    let mailData = {
      to: info.email,
      from: process.env.SMTP_FROM,
      subject: 'Password reset',
      html: html
    }

    AppUser.app.models.Email.send(mailData, (error) => {
      if (error) return console.log('ERROR > SENDING PASSWORD RESET EMAIL > ', error);
      console.log('SENDING > PASSWORD RESET EMAIL TO > ', info.email);
    });
  });

  AppUser.afterRemote('login', function (ctx, user, next) {
    // Update lastLoginDate Field
    const updateLoginDate = async () => {
      const currentDate = new Date()
      try {
        let updatedInstance = user.updateAttribute('lastLoginDate', currentDate);
        next();
      } catch (error) {
        console.error('ERROR > UPDATING LAST LOGIN > ', error);
        return next(error);
      }
    }
    updateLoginDate();
  });
};
