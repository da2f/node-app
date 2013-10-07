
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var swig = require('swig');

var app = express();
var srv = require('http').createServer(app);
var config = require('./config');

app.engine('html', swig.renderFile);

// all environments
app.set('port', config.get('port') || process.env.PORT || 3000);
app.set('templates', __dirname + '/templates');
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(require('./libs/response')(app, srv));
app.use(app.router);
app.use(require('less-middleware')({
  debug: 'development' == app.get('env'),
  src: __dirname + '/public'
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());

  app.set('view cache', false);
  swig.setDefaults({cache: false});
}

require('./routes/config')(app);

require('http').createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});