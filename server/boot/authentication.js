'use strict';

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth();

  server.get('/verified', function(req, res) {
    res.render('verified');
  });
};
