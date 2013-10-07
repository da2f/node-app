var pile = require('piler');
var path = require('path');

module.exports = function (app, srv) {
  var js = pile.createJSManager({ outputDirectory: __dirname + '/out'});
  js.bind(app, srv);

  js.addFile(path.join(__dirname, "../public/vendor/js/underscore-1.5.2.js"));
  js.addFile(path.join(__dirname, "../public/vendor/js/jquery-1.10.2.js"));

  return {
    js: js.renderTags()
  };
};