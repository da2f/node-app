
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var swig = require('swig');

var app = express();
var config = require('./config');

app.engine('html', swig.renderFile);

// all environments
app.set('port', process.env.PORT || config.get('port') || 3000);
app.set('env', process.env.ENV_MODE || config.get('env_mode') || 'development');
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(config.get('secret_key')));
app.use(express.session());
app.use(require('./libs/render-middleware')(app, {
    tplsrc: path.join(__dirname, '/templates'),
    tplfilename: path.join(__dirname, '/public/', 'tpl.js'),
    tplnamespace: 'swigTpl'
}));
app.use(require('less-middleware')({
  debug: 'development' == app.get('env'),
  src: path.join(__dirname, '/public')
}));
app.use(app.router);
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, '/public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());

  app.set('view cache', false);
  swig.setDefaults({cache: false});
}

swig.setDefaults({
    autoescape: false,
    locals: {DEV_MODE: app.get('env') === 'development'}
});
require('./libs/swig')(swig);

require('ex-route')(app, {
    src: path.join(__dirname, '/routes'),
    debug: app.get('env') === 'development'
});

if (!module.parent) {
    require('http').createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
} else {
    module.exports = app;
}