
/*
 * GET users listing.
 */

module.exports = [
  {
    method: 'get',
    options: '/users',
    callback: function (req, res) {
      res.send('respond with a resource');
    }
  }
];