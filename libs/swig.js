
var filters = [
    {
        name: 'modulo',
        method: function (dividend, divisor) {
            return +dividend % +divisor === 0;
        }
    }
];

var tags = [
    {
        name: 'grid',
        parse: function (str, line, parser, types) {
            var firstVar, ready;

            parser.on(types.NUMBER, function (token) {
                if (this.prevToken.match === 'by') {
                    return true;
                }

                var lastState = this.state.length ? this.state[this.state.length - 1] : null;
                if (!ready ||
                    (lastState !== types.ARRAYOPEN &&
                        lastState !== types.CURLYOPEN &&
                        lastState !== types.CURLYCLOSE &&
                        lastState !== types.FUNCTION &&
                        lastState !== types.FILTER)
                    ) {
                    throw new Error('Unexpected number "' + token.match + '" on line ' + line + '.');
                }

                return true;
            });

            parser.on(types.VAR, function (token) {
                if (token.match === 'by') {
                    if (this.prevToken.match === 'by') {
                        throw new Error('Reserved keyword "' + token.match + '" on line ' + line + '.');
                    }
                    return;
                }

                if (ready && firstVar) {
                    return true;
                }

                if (!this.out.length) {
                    firstVar = true;
                }

                this.out.push(token.match);
            });

            parser.on(types.COMMA, function (token) {
                if (firstVar && this.prevToken.type === types.VAR) {
                    this.out.push(token.match);
                    return;
                }

                return true;
            });

            parser.on(types.COMPARATOR, function (token) {
                if ((token.match !== 'in' && token.math !== 'by') || !firstVar) {
                    throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
                }
                ready = true;
            });

            return true;
        },
        compile: function (compiler, args, content, parents, options, blockName) {
            var by = args.pop(),
                prefix = "<div class='row'>",
                postfix = '</div>',
                val = args.shift(),
                key = '__k',
                last;

            if (args[0] && args[0] === ',') {
                args.shift();
                key = val;
                val = args.shift();
            }

            last = args.join('');

            var output = [
                '(function () {\n',
                '  var __l = ' + last + ';\n',
                '  var __by = ' + by + ';\n',
                '  if (!__l) { return; }\n',
                '  if (!_utils.isArray(__l)) {\n',
                '    var ____l = [];\n',
                '    _utils.each(__l, function (__val, __key) {\n',
                '      ____l.push(__val);\n',
                '    });\n',
                '    __l = ____l;\n',
                '  }\n',
                '  _output += "' + prefix + '"\n',
                '  var loop = { first: false, index: 1, index0: 0, revindex: __l.length, revindex0: __l.length - 1, length: __l.length, last: false };\n',
                '  _utils.each(__l, function (' + val + ', ' + key + ') {\n',
                '    loop.key = ' + key + ';\n',
                '    loop.first = (loop.index0 === 0);\n',
                '    loop.last = (loop.revindex0 === 0);\n',
                '    if (loop.index0 && loop.index0 % __by === 0) {\n',
                '      _output += "' + postfix + prefix + '"\n',
                '    }\n',
                '    ' + compiler(content, parents, options, blockName),
                '    if (loop.last) {\n',
                '      _output += "' + postfix + '"\n',
                '    }\n',
                '    loop.index += 1; loop.index0 += 1; loop.revindex -= 1; loop.revindex0 -= 1;\n',
                '  });\n',
                '})();\n'
            ];

            return output.join('');
        },
        ends: true
    }
];

module.exports = function (swig) {
    for (var ind = filters.length; ind-- > 0;) {
        filters[ind].name && swig.setFilter(filters[ind].name, filters[ind].method);
    }

    for (var ind = tags.length; ind-- > 0;) {
        tags[ind].name && swig.setTag(tags[ind].name, tags[ind].parse, tags[ind].compile, !!tags[ind].ends, !!tags[ind].blockLevel);
    }
};