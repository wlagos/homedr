'use strict';

const _ = require('lodash');
const StateLists = require('../states');

module.exports = function (Booking) {
  // Function to validate zipcode
  function zipValidator(err) {
    if (this.zip && this.zip.toString().length != 5) err();
  }
  Booking.validate('zip', zipValidator, { message: 'Invalid zip' });

  // Validate state length to 2
  Booking.validatesLengthOf('state', { min: 2, max: 2 });

  // Validate state from state list
  Booking.validatesInclusionOf('state', { in: StateLists, message: 'Invalid state!' });

  // Function to validate dispatcher id with role=DISPATCHER
  async function dispatcherRole(err, done) {
    const Role = Booking.app.models.Role;
    if (!this.dispatcherId) {
      process.nextTick(function () {
        done();
      });
      return;
    }
    let filter = {
      principalId: this.dispatcherId,
      principalType: 'USER'
    }
    try {
      let roles = await Role.getRoles(filter, { returnOnlyRoleNames: true });
      process.nextTick(function () {
        if (!_.intersection(roles, ['DISPATCHER', 'ADMIN']).length) {
          err();
        }
        done();
      });
    } catch (error) {
      process.nextTick(function () {
        err();
        done();
      });
    }
  }
  Booking.validateAsync('dispatcherId', dispatcherRole, { message: 'Invalid dispatcher Id' });

  // Function to validate provider id with role=PROVIDER
  async function providerRole(err, done) {
    const Role = Booking.app.models.Role;
    if (!this.providerId) {
      process.nextTick(function () {
        done();
      });
      return;
    }
    let filter = {
      principalId: this.providerId,
      principalType: 'USER'
    }
    try {
      let roles = await Role.getRoles(filter, { returnOnlyRoleNames: true });
      process.nextTick(function () {
        if (!_.intersection(roles, ['PROVIDER', 'ADMIN']).length) {
          err();
        }
        done();
      });
    } catch (error) {
      process.nextTick(function () {
        err();
        done();
      });
    }
  }
  Booking.validateAsync('providerId', providerRole, { message: 'Invalid provider Id' });

  // last user that edited booking
  Booking.observe('before save', (ctx, next) => {
    let data = ctx.instance || ctx.data;
    if (ctx.options && ctx.options.accessToken) {
      data.lastUpdatedUserId = ctx.options.accessToken.userId
    }
    next();
  });

  // last user that edited booking
  Booking.beforeRemote('create', (ctx, instance, next) => {
    ctx.req.body.userId = ctx.req.accessToken.userId;
    next();
  });
};
