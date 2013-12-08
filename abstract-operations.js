"use strict";

var assert = require("./meta").assert;

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
exports.IsCallable = function (argument) {
    return typeof argument === "function";
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
//   The actual steps include testing whether `x` has a `[[Construct]]` internal method.
//   This is NOT possible to determine in pure JS, so this is just an approximation.
exports.IsConstructor = function (argument) {
    return typeof argument === "function";
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-data-types-and-values
//   From https://gist.github.com/Benvie/7778566
exports.Type = function (x) {
    switch (typeof x) {
    case "string":
        return "String";
    case "number":
        return "Number";
    case "boolean":
        return "Boolean";
    case "symbol":
        return "Symbol";
    case "undefined":
        return "Undefined";
    case "object":
        if (x === null) {
            return "Null";
        }
        return "Object";
    case "function":
        return "Object";
    }
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
exports.IsPropertyKey = function (argument) {
    if (exports.Type(argument) === "String") {
        return true;
    }
    if (exports.Type(argument) === "Symbol") {
        return true;
    }
    return false;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-o-p
exports.Get = function (O, P) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);

    return O[P];
};
