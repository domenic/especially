"use strict";

var assert = require("./meta").assert;
var intrinsics = require("./intrinsics");
var make_slots = require("./meta").make_slots;
var atAtCreate = require("./well-known-symbols")["@@create"];
var atAtIterator = require("./well-known-symbols")["@@iterator"];
var sign = require("./math").sign;
var floor = require("./math").floor;
var abs = require("./math").abs;
var min = require("./math").min;

var global_Object = global.Object;
var global_String = global.String;
var Number_isNaN = Number.isNaN;
var Math_pow = Math.pow;
var Object_is = Object.is;

// Necessary for CreateFromConstructor to work properly.
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-function.prototype-@@create
Function.prototype[atAtCreate] = function () {
    return exports.OrdinaryCreateFromConstructor(this, "%ObjectPrototype%");
};

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

/// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-createdataproperty
exports.CreateDataProperty = function (O, P, V) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);

    let newDesc = { value: V, writable: true, enumerable: true, configurable: true };
    return Object.defineProperty(O, P, newDesc);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-hasproperty
exports.HasProperty = function (O, P) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);
    return P in O;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
exports.SameValue = function (x, y) {
    return Object_is(x, y);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
exports.SameValueZero = function (x, y) {
    return (x === 0 && y === 0) || Object_is(x, y);
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

    return global_Object(argument);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
exports.ToBoolean = function (argument) {
    return !!argument;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
exports.ToString = function (argument) {
    return global_String(argument);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tonumber
exports.ToNumber = function (argument) {
    return +argument;
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
exports.ToInteger = function (argument) {
    let number = exports.ToNumber(argument);
    if (Number_isNaN(number)) {
        return +0;
    }

    if (number === 0 || number === -Infinity || number === +Infinity) {
        return number;
    }

    return sign(number) * floor(abs(number));
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
exports.ToLength = function (argument) {
    let len = exports.ToInteger(argument);
    if (len <= +0) {
        return +0;
    }

    return min(len, Math_pow(2, 53) - 1);
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-hours-minutes-second-and-milliseconds
const HoursPerDay = 24;
const MinutesPerHour = 60;
const SecondsPerMinute = 60;
const msPerSecond = 1000;
const msPerMinute = msPerSecond * SecondsPerMinute;
const msPerHour = msPerMinute * MinutesPerHour;

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-day-number-and-time-within-day
const msPerDay = 86400000;

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-hours-minutes-second-and-milliseconds
exports.HourFromTime = function (t) {
    return floor(t / msPerHour) % HoursPerDay;
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-hours-minutes-second-and-milliseconds
exports.MinFromTime = function (t) {
    return floor(t / msPerMinute) % MinutesPerHour;
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-hours-minutes-second-and-milliseconds
exports.SecFromTime = function (t) {
    return floor(t / msPerSecond) % SecondsPerMinute;
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-hours-minutes-second-and-milliseconds
exports.msFromTime = function (t) {
    return t % msPerSecond;
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-year-number
exports.TimeFromYear = function (y) {
    return msPerDay * exports.DayFromYear(y);
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-year-number
exports.DayFromYear = function (y) {
    return 365 * (y - 1970) + floor((y - 1969) / 4) -
        floor((y - 1901) / 100) + floor((y - 1601) / 400);
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-year-number
exports.YearFromTime = function (t) {
    return new Date(t).getUTCFullYear();
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-year-number
exports.DaysInYear = function (y) {
    if ((y % 4) !== 0) {
        return 365;
    }
    if ((y % 4) === 0 && (y % 100) !== 0) {
        return 366;
    }
    if ((y % 100) === 0 && (y % 400 !== 0)) {
        return 365;
    }
    if ((y % 400) === 0) {
        return 366;
    }
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-year-number
exports.InLeapYear = function (t) {
    switch (exports.DaysInYear(exports.YearFromTime(t))) {
        case 365:
            return 0;
        case 366:
            return 1;
    }
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-day-number-and-time-within-day
exports.Day = function (t) {
    return floor(t / msPerDay);
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-day-number-and-time-within-day
exports.TimeWithinDay = function (t) {
    return t % msPerDay;
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-month-number
exports.DayWithinYear = function (t) {
    return exports.Day(t) - exports.DayFromYear(exports.YearFromTime(t));
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-month-number
exports.MonthFromTime = function (t) {
    var day = exports.DayWithinYear(t);
    var leap = exports.InLeapYear(t);
    if (0 <= day && day < 31) {
        return 0;
    }
    if (31 <= day && day < 59 + leap) {
        return 1;
    }
    if (59 <= day && day < 90 + leap) {
        return 2;
    }
    if (90 <= day && day < 120 + leap) {
        return 3;
    }
    if (120 <= day && day < 151 + leap) {
        return 4;
    }
    if (151 <= day && day < 181 + leap) {
        return 5;
    }
    if (181 <= day && day < 212 + leap) {
        return 6;
    }
    if (212 <= day && day < 243 + leap) {
        return 7;
    }
    if (243 <= day && day < 273 + leap) {
        return 8;
    }
    if (273 <= day && day < 304 + leap) {
        return 9;
    }
    if (304 <= day && day < 334 + leap) {
        return 10;
    }
    if (334 <= day && day < 365 + leap) {
        return 11;
    }
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-date-number
exports.DateFromTime = function (t) {
    switch (exports.MonthFromTime(t)) {
        case 0:
            return exports.DayWithinYear(t) + 1;
        case 1:
            return exports.DayWithinYear(t) - 30;
        case 2:
            return exports.DayWithinYear(t) - 58 - exports.InLeapYear(t);
        case 3:
            return exports.DayWithinYear(t) - 89 - exports.InLeapYear(t);
        case 4:
            return exports.DayWithinYear(t) - 119 - exports.InLeapYear(t);
        case 5:
            return exports.DayWithinYear(t) - 150 - exports.InLeapYear(t);
        case 6:
            return exports.DayWithinYear(t) - 180 - exports.InLeapYear(t);
        case 7:
            return exports.DayWithinYear(t) - 211 - exports.InLeapYear(t);
        case 8:
            return exports.DayWithinYear(t) - 242 - exports.InLeapYear(t);
        case 9:
            return exports.DayWithinYear(t) - 272 - exports.InLeapYear(t);
        case 10:
            return exports.DayWithinYear(t) - 303 - exports.InLeapYear(t);
        case 11:
            return exports.DayWithinYear(t) - 333 - exports.InLeapYear(t);
    }
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-timeclip
exports.TimeClip = function (time) {
    if (!Number.isFinite(time)) {
        return NaN;
    }
    if (abs(time) > 8.64e15) {
        return NaN;
    }
    return exports.ToInteger(time) + (+0);
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-maketime
exports.MakeTime = function (hour, min, sec, ms) {
    if (
        !Number.isFinite(hour) || !Number.isFinite(min) ||
        !Number.isFinite(sec) || !Number.isFinite(ms)
    ) {
        return NaN;
    }
    var h = exports.ToInteger(hour);
    var m = exports.ToInteger(min);
    var s = exports.ToInteger(sec);
    var milli = exports.ToInteger(ms);
    var t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
    return t;
};

// Utility function used in `MakeDay`.
function zeroPad(number, total) {
    var string = String(number);
    return string.length < total ?
        "0".repeat(total - string.length) + string:
        string;
}

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-makeday
exports.MakeDay = function (year, month, date) {
    if (
        !Number.isFinite(year) || !Number.isFinite(month) ||
        !Number.isFinite(date)
    ) {
        return NaN;
    }
    var y = exports.ToInteger(year);
    var m = exports.ToInteger(month);
    var dt = exports.ToInteger(date);
    var ym = y + floor(m / 12);
    var mn = m % 12;
    var t = Date.parse(zeroPad(ym, 4) + "-" + zeroPad(mn, 2) + "-01T00:00:00.000Z");
    if (Number_isNaN(t)) {
        return NaN;
    }
    return exports.Day(t) + dt - 1;
};

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-makedate
exports.MakeDate = function (day, time) {
    if (!Number.isFinite(day) || !Number.isFinite(time)) {
        return NaN;
    }
    return day * msPerDay + time;
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
