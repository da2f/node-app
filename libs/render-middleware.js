var _ = require('underscore');
var async = require('async');

var noop = function (options, callback) {
  callback(options);
  return options;
};

module.exports = function (app, opts) {
  var bundle = app ? require('../libs/bundle')(app, opts) : noop;
  var templates = app ? require('../libs/templates')(app, opts) : noop;
  return function (req, res, next) {
    var __render = res.render;
    res.render = function (view, options, callback) {
      async.parallel(
        [
          function (callback) {
            bundle(options, callback);
          },
          function (callback) {
            templates(options, callback);
          }
        ],
        function (err, results) {
            if (err) {
                throw new Error(err);
            }
          __render.call(res, view, _.extend.apply(this, [options].concat(results || [])), callback);
        }
      )
    };
    next();
  };
};