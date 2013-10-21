
/*
 * GET home page.
 */

var js = [
  "/public/js/index.default.js"
];

module.exports = {
  method: 'get',
  options: '/',
  callback:  function (req, res) {
    res.render('index', {title: 'Index', js: {namespace: 'index', files: js}});
  }
};