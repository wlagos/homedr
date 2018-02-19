const createError = (status, message) => {
  let errorObj = new Error(message);
  errorObj.statusCode = status;
  return errorObj;
}

module.exports = async function (app, cb) {
  app.remotes().phases
    .addBefore('auth', 'check-user-disabled')
    .use(async function (ctx, next) {
      const req = ctx.req;
      if (!req.accessToken) {
        return next();
      }
      const AppUser = app.models.AppUser;
      let userId = req.accessToken.userId;
      try {
        let userInstance = await AppUser.findById(userId);
        if (!userInstance) {
          return next(createError(404, 'User not found!'));
        }
        if (userInstance.isDisabled) {
          return next(createError(403, 'Your account has been disabled!'));
        }
        if (ctx.req.remotingContext.args.options) {
          ctx.req.remotingContext.args.options.currentUser = userInstance;
        }
        next();
      } catch (error) {
        return next(error);
      }
    });
  cb();
}