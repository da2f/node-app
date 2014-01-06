var _ = require('underscore');
var pile = require('piler');
var path = require('path');

var jsManager,
    app,
    options = {
        urlRoot: '/static/',
        outputDirectory: __dirname + '/out'
    },
    jsCommonFiles = [
        "/public/vendor/js/swig.js",
        "/public/vendor/js/underscore-1.5.2.js",
        "/public/vendor/js/jquery-1.10.2.js"
    ];

module.exports = function (/* args */) {
    app = arguments.length > 0 ? arguments[0] : app;

    if (app && !jsManager) {
        jsManager = pile.createJSManager(options);
        jsManager.bind(app);
    }

    if (jsManager) {
        for (var ind = 0, len = jsCommonFiles.length; ind < len; ind++) {
            jsCommonFiles[ind] && jsManager.addFile(path.join(__dirname, '../' + jsCommonFiles[ind]));
        }
    }

    return function (opts, callback) {
        opts = opts && typeof opts === 'object' ? opts : {};
        if (!app) {
            return opts;
        }

        var namespace;
        if (opts.hasOwnProperty('js') && opts.js && typeof opts.js === 'object') {
            namespace = opts.js.hasOwnProperty('namespace') ? opts.js.namespace : 'namespace' + Math.round(Math.random() * 1000);
            if (opts.js.hasOwnProperty('files') && _.isArray(opts.js.files)) {
                for (var ind = 0, len = opts.js.files.length; ind < len; ind++) {
                    opts.js.files[ind] && jsManager.addFile(namespace, path.join(__dirname, '../' + opts.js.files[ind]));
                }
            }
        }
        var tags = jsManager.renderTags(namespace);

        if (typeof callback === 'function') {
            callback(null, _.extend(opts, {
                js: tags
            }));
        }

        return _.extend(opts, {
            js: tags
        });
    };
};