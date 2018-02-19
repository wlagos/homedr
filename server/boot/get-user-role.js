const _ = require('lodash');

const createError = (status, message) => {
  let errorObj = new Error(message);
  errorObj.statusCode = status;
  return errorObj;
}

module.exports = async function (app, cb) {
  app.remotes().phases
    .addBefore('auth', 'get-user-role')
    .use(async function (ctx, next) {
      const req = ctx.req;
      if (!req.accessToken || !_.isObject(ctx.req.remotingContext.args.options)) {
        return next();
      }
      const Role = app.models.Role;
      let userId = req.accessToken.userId;
      let filter = {
        principalId: userId,
        principalType: 'USER'
      }
      try {
        let roles = await Role.getRoles(filter, { returnOnlyRoleNames: true });
        ctx.req.remotingContext.args.options.userRoles = roles;
        next();
      } catch (error) {
        return next(error);
      }
    });
  cb();
}