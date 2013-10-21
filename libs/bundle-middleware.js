var bundle = function (options) {
  return options;
};

module.exports = function (app) {
  bundle = app ? require('../libs/bundle')(app) : bundle;
  return function (req, res, next) {
    var __render = res.render;
    res.render = function (view, options, callback) {
      return __render.call(res, view, bundle(options), callback);
    };
    next();
  };
};