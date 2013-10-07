var fs = require('fs');
var path = require('path');
var util = require('util');

module.exports = function (app, callback) {
  fs.readdir(path.join(__dirname), function (err, files) {
    files.forEach(function (file) {

      if (module.filename === path.join(__dirname, file)) {
        return undefined;
      }
      var routes = require(path.join(__dirname, file));
      routes = !util.isArray(routes) ? [routes] : routes;
      for (var ind = 0, len = routes.length; ind < len; ind++) {
        var route = routes[ind];
        if (route && typeof route === 'object') {
          typeof app[route['method']] === 'function' && app[route.method](route.options || {}, route.callback);
        }
      }
    });
    typeof callback === 'function' && callback();
  });
};
