'use strict';

const _ = require('lodash');
const StateLists = require('../states');
const Twilio = require('twilio');
const TwilioClient = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
Stripe.setApiVersion('2018-02-28');

function createError(code, message) {
  let errorObj = new Error(message);
  errorObj.statusCode = code || 400;
  return errorObj;
}

function createBooking(data, options, cb) {

  const Booking = this;
  const AppUser = this.app.models.AppUser;

  const _createBooking = async () => {

    try {
      let stripeCustomer, customerCreated = false;

      // Get User Details
      let userInstance = await AppUser.findById(options.accessToken.userId, {}, options);

      if (!userInstance.stripeCustomer) {
        // Crate Stripe Customer
        let createUser = {
          email: userInstance.email,
          source: data.token.id,
          description: `Customer for user ${userInstance.firstName} (${userInstance.email})`
        }
        stripeCustomer = await Stripe.customers.create(createUser);
        userInstance = await userInstance.updateAttributes({
          stripeCustomer: stripeCustomer
        });
        customerCreated = true;
      } else {
        stripeCustomer = userInstance.stripeCustomer;
      }

      // Update card in customer if new added
      if (data.token && !customerCreated) {
        let stripeCard = await Stripe.customers.createSource(stripeCustomer.id, {
          source: data.token.id
        });
        stripeCustomer = await Stripe.customers.update(stripeCustomer.id, {
          default_source: stripeCard.id
        });
        userInstance = await userInstance.updateAttributes({
          stripeCustomer: stripeCustomer
        });
      }

      // Create Charge Token
      let chargeData = {
        amount: 99,
        currency: "usd",
        description: `Charge for booking by ${userInstance.email}`,
        capture: false,
        customer: stripeCustomer.id
      }

      // if (data.token && !customerCreated) {
      //   chargeData.source = data.token.id
      // } else {
      // chargeData.customer = stripeCustomer.id
      // }

      let chargeInstance = await Stripe.charges.create(chargeData);

      let bookingObj = _.omit(data, ['token']);
      bookingObj.paymentToken = chargeInstance;
      bookingObj.userId = options.accessToken.userId;

      let dispatcherFilter = {
        where: {
          email: 'dispatcher@homedr.com'
        }
      }
      try {
        let dispatcherUser = await AppUser.findOne(dispatcherFilter, options);
        bookingObj.dispatcherId = dispatcherUser ? dispatcherUser.id : null;
      } catch (error) {
        console.error('ERROR > ', error);
      }

      let bookingInstance = await Booking.create(bookingObj, options);

      return cb(null, bookingInstance);
    } catch (error) {
      let statusCode = error.statusCode || error.code || error.status || 500;
      let message = error.message || 'Something went wrong!';
      return cb(createError(statusCode, message));
    }
  }

  _createBooking();
}

function charge(options, cb) {
  let bookingInstance = this;
  const chargeBooking = async () => {
    if (!bookingInstance.paymentToken) {
      let statusCode = 403;
      let message = 'Payment details not found!';
      return cb(createError(statusCode, message));
    }
    try {
      let stripeCharge = await Stripe.charges.capture(bookingInstance.paymentToken.id);
      let updatedInstance = await bookingInstance.updateAttributes({
        paymentToken: stripeCharge
      })
      let successObj = {
        statusCode: 200,
        status: 200,
        message: 'Charge successful'
      }
      return cb(null, successObj);
    } catch (error) {
      let statusCode = error.statusCode || error.code || error.status || 500;
      let message = error.message || 'Something went wrong!';
      return cb(createError(statusCode, message));
    }
  }

  chargeBooking();
}

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

  // adding creator
  Booking.beforeRemote('create', (ctx, instance, next) => {
    ctx.req.body.userId = ctx.req.accessToken.userId;
    next();
  });

  Booking.beforeRemote('find', (ctx, instance, next) => {
    if (instance instanceof Function) {
      next = instance;
    }
    const checkRole = async () => {
      const Role = Booking.app.models.Role;
      let filter = {
        principalId: ctx.req.accessToken.userId,
        principalType: 'USER'
      }
      try {
        let roles = await Role.getRoles(filter, { returnOnlyRoleNames: true });
        let where = {};
        if (_.includes(roles, 'ADMIN')) {
          where = {
            // userId: ctx.req.accessToken.userId
          }
        } else if (_.includes(roles, 'DISPATCHER')) {
          where = {
            dispatcherId: ctx.req.accessToken.userId
          }
        } else if (_.includes(roles, 'PROVIDER')) {
          where = {
            providerId: ctx.req.accessToken.userId
          }
        } else {
          where = {
            userId: ctx.req.accessToken.userId
          }
        }
        if (!ctx.args.filter) {
          ctx.args.filter = {
            where: {
            }
          }
        }
        if (!ctx.args.filter.where) {
          ctx.args.filter.where = where
        } else {
          ctx.args.filter.where = {
            and: [ctx.args.filter.where, where]
          }
        }
        next();
      } catch (error) {
        return next(error);
      }

    }
    checkRole();
  });

  Booking.beforeRemote('prototype.patchAttributes', (ctx, instance, next) => {
    if (instance instanceof Function) {
      next = instance;
    }
    if (ctx.req.body && ctx.req.body.status === 'PENDING' && ctx.req.body.providerId) {
      ctx.req.body.status = 'CONFIRMED';
    }
    next();
  });

  // Creating Booking Custom
  Booking.createBooking = createBooking;
  Booking.remoteMethod('createBooking', {
    accepts: [
      { arg: 'data', type: 'object', require: true, http: { source: 'body' } },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' }
    ],
    http: {
      verb: 'POST',
      path: '/create-booking'
    },
    returns: { arg: 'data', type: 'object', root: true }
  });

  // Charge a booking
  Booking.prototype.charge = charge;
  Booking.remoteMethod('prototype.charge', {
    accepts: [
      { arg: 'options', type: 'object', http: 'optionsFromRequest' }
    ],
    http: {
      verb: 'POST',
      path: '/charge'
    },
    returns: { arg: 'data', type: 'object', root: true }
  });

  Booking.observe('before save', (ctx, next) => {
    if (ctx.isNewInstance && !ctx.currentInstance) {
      return next();
    }
    ctx.hookState.oldStatus = ctx.currentInstance.status;
    next();
  });

  Booking.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance || !ctx.hookState) {
      return next();
    }
    if (ctx.hookState.oldStatus == 'PENDING' && ctx.instance.status == 'CONFIRMED') {
      const doCharge = async () => {
        ctx.instance.charge(ctx.options, (error, successObj) => {
          if (error) {
            return next(error);
          }
          next(null, ctx.instance);
        });

      }

      doCharge();
    } else {
      next();
    }
  });

  Booking.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance) {
      let hosturl = process.env.APP_URL;
      let bookingUrl = `${hosturl}/booking/${ctx.instance.id}`;
      let createMessage = {
        to: process.env.TWILIO_TO,
        from: process.env.TWILIO_FROM,
        body: `Booking has been registered - ${bookingUrl}`,
      }
      TwilioClient.messages.create(createMessage)
        .then((message) => {
          console.log('TWILIO MSG SENT > ', message);
        })
        .catch((error) => {
          console.error('TWILIO MSG ERROR > ', error);
        });
    }
    next()
  })
};
