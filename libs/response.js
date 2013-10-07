var _ = require('underscore');

module.exports = function (app, srv) {
  var bundle = require('../libs/bundle')(app, srv);

  return function (req, res, next) {
    var __render = res.render;
    res.render = function (view, options, callback) {
      return __render.call(res, view, options && typeof options === 'object' ? _.extend(options, bundle) : options, callback);
    };
    next();
  };
};