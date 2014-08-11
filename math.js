"use strict";

var assert = require("./meta").assert;

var global_isNaN = global.isNaN;
var Math_abs = Math.abs;
var Math_floor = Math.floor;
var Math_min = Math.min;

exports.sign = function (x) {
    assert(typeof x === "number");
    assert(x !== 0);
    assert(x !== Infinity);
    assert(x !== -Infinity);
    assert(!global_isNaN(x));
    return x < 0 ? -1 : +1;
};

exports.floor = function (x) {
    assert(typeof x === "number");
    assert(x !== Infinity);
    assert(x !== -Infinity);
    assert(!global_isNaN(x));
    return Math_floor(x);
};

exports.abs = function (x) {
    assert(typeof x === "number");
    assert(!global_isNaN(x));
    return Math_abs(x);
};

exports.min = function () {
    for (var i = 0; i < arguments.length; ++i) {
        var x = arguments[i];
        assert(typeof x === "number");
        assert(!global_isNaN(x));
    }

    return Math_min.apply(undefined, arguments);
};
