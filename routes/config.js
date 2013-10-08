var fs = require('fs');
var path = require('path');
var util = require('util');

function fn (dir, items, callback, o) {
  if (!o) {
    o = {
      to: null,
      success: function () {
        callback(null, items);
      }
    };
  }
  dir = path.join(dir);
  fs.readdir(dir, function (err, files) {
    clearTimeout(o.to);
    if (err) {
      return callback(err)
    }
    files.forEach(function (file) {
      file = path.join(dir, file);
      fs.stat(file, function (err, stats) {
        if (err) {
          return callback(err)
        }
        stats.isFile() && items.push(file);
        stats.isDirectory() && fn(file, items, callback, o);
      })
    });
    o.to = setTimeout(o.success, 0);
  });
}

function readdirext (dir, callback) {
  fn(dir, [], callback);
}

module.exports = function (app, callback) {
  readdirext(__dirname, function (err, files) {
    if (err) {
      return callback(err)
    }

    files.forEach(function (file) {
      if (module.filename === file || file.substr(-3) !== '.js') {
        return undefined;
      }

      var routes = require(file);
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
