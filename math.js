"use strict";

var assert = require("./meta").assert;

exports.sign = function (x) {
    assert(x !== 0);
    assert(x !== Infinity);
    assert(x !== -Infinity);
    assert(!isNaN(x));
    return x < 0 ? -1 : +1;
};

exports.floor = function (x) {
    assert(x !== Infinity);
    assert(x !== -Infinity);
    assert(!isNaN(x));
    return Math.floor(x);
};

exports.abs = function (x) {
    assert(x !== Infinity);
    assert(x !== -Infinity);
    assert(!isNaN(x));
    return Math.abs(x);
};

exports.min = function () {
    for (var i = 0; i < arguments.length; ++i) {
        var x = arguments[i];
        assert(x !== Infinity);
        assert(x !== -Infinity);
        assert(!isNaN(x));
    }

    return Math.min.apply(undefined, arguments);
};
