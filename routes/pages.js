
/*
 * GET pages.
 */

var js = [
  "/public/js/page.default.js"
];

module.exports = [
  {
    method: 'get',
    options: '/pages',
    callback: function (req, res) {
      res.render('pages', {
        title: 'Pages',
        pages: [
          {
            title: 'Index Page',
            href: '/'
          },
          {
            title: 'Some Page',
            href: '/pages/1'
          }
        ]
      });
    }
  },
  {
    method: 'get',
    options: '/pages/:id',
    callback: function (req, res) {
      res.render('page', {title: 'Some', js: {namespace: 'page', files: js}});
    }
  }
];