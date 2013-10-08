
/*
 * GET users listing.
 */

module.exports = [
  {
    method: 'get',
    options: '/api/users',
    callback: function (req, res) {
      res.send([{id: 1, name: 'respond with a resource'}]);
    }
  }
];