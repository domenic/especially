"use strict";

const assert = require("./meta").assert;

const global_isNaN = global.isNaN;
const Math_abs = Math.abs;
const Math_floor = Math.floor;
const Math_min = Math.min;

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
    for (let i = 0; i < arguments.length; ++i) {
        const x = arguments[i];
        assert(typeof x === "number");
        assert(!global_isNaN(x));
    }

    return Math_min.apply(undefined, arguments);
};
