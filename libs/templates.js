var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var async = require('async');
var child_process = require('child_process');

var app,
    defaultOptions = {
        tplsrc: null,
        tplnamespace: 'window',
        tplfilename: 'tpl.js'
    },
    tpl = null;

function readdir (dir, callback) {
    fs.readdir(dir, function (err, files) {
        if (err) {
            return callback(err);
        }
        var tasks = [], precompiles = [];
        for (var ind = 0, len = files.length; ind < len; ind++) {
            tasks.push((function (file) {
                return function (cb) {
                    child_process.exec('node node_modules/swig/bin/swig.js compile ' + file + ' --m', function (err, stdout, stderr) {
                        if (err) {
                            return cb(err);
                        }
                        cb(null, {name: path.basename(file, path.extname(file)), src: file, tpl: stdout.replace(/^var tpl=/, '')});
                    });
                    //swig.compileFile(file, {}, function (err, output) {
                    //    if (err) {
                    //        return cb(err);
                    //    }
                    //    cb(null, output);
                    //});
                };
            })(path.join(dir, files[ind])));
        }
        //callback(null, files);
        async.parallel(tasks, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    });
}

function getWebPath (ospath) {
    var apppath = process.mainModule.filename;

    ospath = String(ospath).split(path.sep);
    apppath = String(apppath).split(path.sep);

    var webpath = [];
    for (var ind = 0, len = ospath.length; ind < len; ind++) {
        if (ospath[ind] === apppath[ind]) {
            continue;
        }
        webpath.push(ospath[ind]);
    }
    webpath = webpath.join('/');
    webpath = webpath.indexOf('//') !== -1 ? webpath : webpath.charAt(0) === '/' ? webpath : '/' + webpath;

    return webpath;
}

module.exports = function (/* args */) {
    app = arguments.length > 0 ? arguments[0] : app;
    options = arguments.length > 1 ? _.extend({}, defaultOptions, arguments[1] || {}) : defaultOptions;

    return function (opts, callback) {
        opts = opts && typeof opts === 'object' ? opts : {};
        if (!app) {
            return opts;
        }

        if (tpl === null && typeof callback === 'function') {
            if (options && options.tplsrc) {
                var __callback__ = callback;
                callback = function () {
                    readdir(options.tplsrc, function (err, files) {
                        //file - function (swig, context, filters, utils,) {}
                        if (err) {
                            return __callback__(err);
                        }
                        var jsfile = [];
                        if (options.tplnamespace !== defaultOptions.tplnamespace) {
                            jsfile.push('window["' + options.tplnamespace + '"]={};')
                        }
                        for (var ind = 0, len = files.length; ind < len; ind++) {
                            jsfile.push(options.tplnamespace + '["' + files[ind].name + '"]=' + files[ind].tpl);
                        }
                        fs.writeFile(options.tplfilename, jsfile.join('\n'), {flag: 'w'}, function (err) {
                            if (err) {
                                return __callback__(err);
                            }
                            tpl = '<script src="' + getWebPath(options.tplfilename) + '"></script>';
                            __callback__(null, _.extend(opts, {
                                tpl: tpl || ''
                            }));
                        });
                    });
                };
            }
        }

        if (typeof callback === 'function') {
            callback(null, _.extend(opts, {
                tpl: tpl || ''
            }));
        }

        return _.extend(opts, {
            tpl: tpl || ''
        });
    };
};