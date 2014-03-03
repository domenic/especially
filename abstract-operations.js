"use strict";

var assert = require("./meta").assert;
var intrinsics = require("./intrinsics");
var make_slots = require("./meta").make_slots;
var atAtCreate = require("./well-known-symbols")["@@create"];
var atAtIterator = require("./well-known-symbols")["@@iterator"];

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

exports.CreateDataProperty = function (O, P, V) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);

    let newDesc = { value: V, writable: true, enumerable: true, configurable: true };
    return Object.defineProperty(O, P, newDesc);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
exports.SameValue = function (x, y) {
    return Object.is(x, y);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-arraycreate
// plus https://bugs.ecmascript.org/show_bug.cgi?id=2346
exports.ArrayCreate = function (length) {
    assert(length === undefined || exports.Type(length) === "Number" && length >= 0);
    if (length === undefined) {
        throw new TypeError("We don't support the `length` of `undefined` case.");
    }
    if (arguments.length > 1) {
        throw new TypeError("We don't support the optional `proto` argument.");
    }

    return new Array(length);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-objectcreate
exports.ObjectCreate = function (proto, internalDataList) {
    if (internalDataList === undefined) {
        internalDataList = [];
    }

    let obj = Object.create(proto);
    make_slots(obj, internalDataList);

    return obj;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-getprototypefromconstructor
exports.GetPrototypeFromConstructor = function (constructor, intrinsicDefaultProto) {
    assert(exports.Type(intrinsicDefaultProto) === "String" && intrinsicDefaultProto in intrinsics);

    if (exports.IsConstructor(constructor) === false) {
        throw new TypeError("Given a non-constructor");
    }

    var proto = exports.Get(constructor, "prototype");

    if (exports.Type(proto) !== "Object") {
        proto = intrinsics[intrinsicDefaultProto];
    }

    return proto;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-createfromconstructor
exports.CreateFromConstructor = function (F) {
    let creator = exports.Get(F, atAtCreate);
    if (creator === undefined) {
        return undefined;
    }

    if (exports.IsCallable(creator) === false) {
        throw new TypeError("Non-callable @@create value");
    }

    let obj = creator.apply(F, []);

    if (exports.Type(obj) !== "Object") {
        throw new TypeError("Non-object created");
    }

    return obj;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ordinarycreatefromconstructor
exports.OrdinaryCreateFromConstructor = function (constructor, intrinsicDefaultProto, internalDataList) {
    assert(exports.Type(intrinsicDefaultProto) === "String" && intrinsicDefaultProto in intrinsics);

    let proto = exports.GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
    return exports.ObjectCreate(proto, internalDataList);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ordinaryconstruct
exports.OrdinaryConstruct = function (F, argumentsList) {
    let creator = exports.Get(F, atAtCreate);
    var obj;
    if (creator !== undefined) {
        if (exports.IsCallable(creator) === false) {
            throw new TypeError("Non-callable @@create value");
        }
        obj = creator.apply(F, []);
    } else {
        obj = exports.OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
    }

    if (exports.Type(obj) !== "Object") {
        throw new TypeError("Non-object created.");
    }

    let result = F.apply(obj, argumentsList);

    if (exports.Type(result) === "Object") {
        return result;
    }

    return obj;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
exports.ToObject = function (argument) {
    if (argument === null || argument === undefined) {
        throw new TypeError("Null or undefined passed to ToObject");
    }

    return Object(argument);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
exports.ToBoolean = function (argument) {
    return Boolean(argument);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-getmethod
exports.GetMethod = function (O, P) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);

    let func = O[P];

    if (func === undefined) {
        return undefined;
    }

    if (exports.IsCallable(func) === false) {
        throw new TypeError("Non-callable, non-undefined method.");
    }

    return func;
};

// https://github.com/domenic/promises-unwrapping/issues/74#issuecomment-28428416
exports.Invoke = function (O, P, args) {
    assert(exports.IsPropertyKey(P));

    if (arguments.length < 3) {
        args = [];
    }

    let obj = exports.ToObject(O);
    let func = exports.GetMethod(obj, P);

    if (func === undefined) {
        throw new TypeError("Tried to invoke undefined method.");
    }

    return func.apply(O, args);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-getiterator
exports.GetIterator = function (obj) {
    let iterator = exports.Invoke(obj, atAtIterator, []);

    if (exports.Type(iterator) !== "Object") {
        throw new TypeError("Non-object iterator returned from @@iterator");
    }

    return iterator;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iteratornext
exports.IteratorNext = function (iterator, value) {
    let result = exports.Invoke(iterator, "next", [value]);

    if (exports.Type(result) !== "Object") {
        throw new TypeError("Result of iterator's `next` method was not an object.");
    }

    return result;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iteratorcomplete
exports.IteratorComplete = function (iterResult) {
    assert(exports.Type(iterResult) === "Object");

    let done = exports.Get(iterResult, "done");

    return exports.ToBoolean(done);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iteratorvalue
exports.IteratorValue = function (iterResult) {
    assert(exports.Type(iterResult) === "Object");

    return exports.Get(iterResult, "value");
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iteratorstep
exports.IteratorStep = function (iterator, value) {
    let result = exports.IteratorNext(iterator, value);
    let done = exports.IteratorComplete(result);

    if (done === true) {
        return false;
    }

    return result;
};

exports.EnqueueTask = function (queueName, task, args) {
    assert(exports.Type(queueName) === "String");
    assert(typeof task === "function");
    assert(Array.isArray(args) && args.length === task.length);

    process.nextTick(function () {
        task.apply(undefined, args);
    });
};
