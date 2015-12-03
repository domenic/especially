"use strict";

const assert = require("./meta").assert;
const intrinsics = require("./intrinsics");
const make_slots = require("./meta").make_slots;
const atAtIterator = require("./well-known-symbols")["@@iterator"];
const atAtSpecies = require("./well-known-symbols")["@@species"];
const sign = require("./math").sign;
const floor = require("./math").floor;
const abs = require("./math").abs;
const min = require("./math").min;

const global_Object = global.Object;
const global_String = global.String;
const Number_isNaN = Number.isNaN;
const Math_pow = Math.pow;
const Object_is = Object.is;

// https://tc39.github.io/ecma262/#sec-call
exports.Call = function (F, V, argumentsList) {
    if (arguments.length === 2) {
        argumentsList = [];
    }

    if (exports.IsCallable(F) === false) {
        throw new TypeError("Tried to call a non-callable function.");
    }

    return F.apply(V, argumentsList);
};

// https://tc39.github.io/ecma262/#sec-iscallable
exports.IsCallable = function (argument) {
    return typeof argument === "function";
};

// https://tc39.github.io/ecma262/#sec-isconstructor
//   The actual steps include testing whether `x` has a `[[Construct]]` internal method.
//   This is NOT possible to determine in pure JS, so this is just an approximation.
exports.IsConstructor = function (argument) {
    return typeof argument === "function";
};

// https://tc39.github.io/ecma262/#sec-invoke
exports.Invoke = function (O, P, argumentsList) {
    assert(exports.IsPropertyKey(P) === true);
    if (arguments.length === 2) {
        argumentsList = [];
    }

    const func = exports.GetV(O, P);
    return exports.Call(func, O, argumentsList);
};

// https://tc39.github.io/ecma262/#sec-getv
exports.GetV = function (V, P) {
    assert(exports.IsPropertyKey(P) === true);
    return V[P];
};

// https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
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

// https://tc39.github.io/ecma262/#sec-ispropertykey
exports.IsPropertyKey = function (argument) {
    if (exports.Type(argument) === "String") {
        return true;
    }
    if (exports.Type(argument) === "Symbol") {
        return true;
    }
    return false;
};

// https://tc39.github.io/ecma262/#sec-get-o-p
exports.Get = function (O, P) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);

    return O[P];
};

/// https://tc39.github.io/ecma262/#sec-createdataproperty
exports.CreateDataProperty = function (O, P, V) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);

    const newDesc = { value: V, writable: true, enumerable: true, configurable: true };
    return Object.defineProperty(O, P, newDesc);
};

// https://tc39.github.io/ecma262/#sec-hasproperty
exports.HasProperty = function (O, P) {
    assert(exports.Type(O) === "Object");
    assert(exports.IsPropertyKey(P) === true);
    return P in O;
};

// https://tc39.github.io/ecma262/#sec-samevalue
exports.SameValue = function (x, y) {
    return Object_is(x, y);
};

// https://tc39.github.io/ecma262/#sec-samevaluezero
exports.SameValueZero = function (x, y) {
    return (x === 0 && y === 0) || Object_is(x, y);
};

// https://tc39.github.io/ecma262/#sec-arraycreate
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

// https://tc39.github.io/ecma262/#sec-objectcreate
exports.ObjectCreate = function (proto, internalSlotsList) {
    if (internalSlotsList === undefined) {
        internalSlotsList = [];
    }

    const obj = Object.create(proto);
    make_slots(obj, internalSlotsList);

    return obj;
};

// https://tc39.github.io/ecma262/#sec-getprototypefromconstructor
exports.GetPrototypeFromConstructor = function (constructor, intrinsicDefaultProto) {
    assert(exports.Type(intrinsicDefaultProto) === "String" && intrinsicDefaultProto in intrinsics);

    if (exports.IsConstructor(constructor) === false) {
        throw new TypeError("Given a non-constructor");
    }

    let proto = exports.Get(constructor, "prototype");

    if (exports.Type(proto) !== "Object") {
        proto = intrinsics[intrinsicDefaultProto];
    }

    return proto;
};

// https://tc39.github.io/ecma262/#sec-ordinarycreatefromconstructor
exports.OrdinaryCreateFromConstructor = function (constructor, intrinsicDefaultProto, internalSlotsList) {
    assert(exports.Type(intrinsicDefaultProto) === "String" && intrinsicDefaultProto in intrinsics);

    const proto = exports.GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
    return exports.ObjectCreate(proto, internalSlotsList);
};

// https://tc39.github.io/ecma262/#sec-toobject
exports.ToObject = function (argument) {
    if (argument === null || argument === undefined) {
        throw new TypeError("Null or undefined passed to ToObject");
    }

    return global_Object(argument);
};

// https://tc39.github.io/ecma262/#sec-toboolean
exports.ToBoolean = function (argument) {
    return !!argument;
};

// https://tc39.github.io/ecma262/#sec-tostring
exports.ToString = function (argument) {
    return global_String(argument);
};

// https://tc39.github.io/ecma262/#sec-tonumber
exports.ToNumber = function (argument) {
    return +argument;
};

// https://tc39.github.io/ecma262/#sec-tointeger
exports.ToInteger = function (argument) {
    const number = exports.ToNumber(argument);
    if (Number_isNaN(number)) {
        return +0;
    }

    if (number === 0 || number === -Infinity || number === +Infinity) {
        return number;
    }

    return sign(number) * floor(abs(number));
};

// https://tc39.github.io/ecma262/#sec-tolength
exports.ToLength = function (argument) {
    const len = exports.ToInteger(argument);
    if (len <= +0) {
        return +0;
    }

    return min(len, Math_pow(2, 53) - 1);
};

// https://tc39.github.io/ecma262/#sec-hours-minutes-second-and-milliseconds
const HoursPerDay = 24;
const MinutesPerHour = 60;
const SecondsPerMinute = 60;
const msPerSecond = 1000;
const msPerMinute = msPerSecond * SecondsPerMinute;
const msPerHour = msPerMinute * MinutesPerHour;

// https://tc39.github.io/ecma262/#sec-day-number-and-time-within-day
const msPerDay = 86400000;

// https://tc39.github.io/ecma262/#sec-hours-minutes-second-and-milliseconds
exports.HourFromTime = function (t) {
    return floor(t / msPerHour) % HoursPerDay;
};

// https://tc39.github.io/ecma262/#sec-hours-minutes-second-and-milliseconds
exports.MinFromTime = function (t) {
    return floor(t / msPerMinute) % MinutesPerHour;
};

// https://tc39.github.io/ecma262/#sec-hours-minutes-second-and-milliseconds
exports.SecFromTime = function (t) {
    return floor(t / msPerSecond) % SecondsPerMinute;
};

// https://tc39.github.io/ecma262/#sec-hours-minutes-second-and-milliseconds
exports.msFromTime = function (t) {
    return t % msPerSecond;
};

// https://tc39.github.io/ecma262/#sec-year-number
exports.TimeFromYear = function (y) {
    return msPerDay * exports.DayFromYear(y);
};

// https://tc39.github.io/ecma262/#sec-year-number
exports.DayFromYear = function (y) {
    return 365 * (y - 1970) + floor((y - 1969) / 4) -
        floor((y - 1901) / 100) + floor((y - 1601) / 400);
};

// https://tc39.github.io/ecma262/#sec-year-number
exports.YearFromTime = function (t) {
    return new Date(t).getUTCFullYear();
};

// https://tc39.github.io/ecma262/#sec-year-number
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

// https://tc39.github.io/ecma262/#sec-year-number
exports.InLeapYear = function (t) {
    switch (exports.DaysInYear(exports.YearFromTime(t))) {
        case 365:
            return 0;
        case 366:
            return 1;
    }
};

// https://tc39.github.io/ecma262/#sec-day-number-and-time-within-day
exports.Day = function (t) {
    return floor(t / msPerDay);
};

// https://tc39.github.io/ecma262/#sec-day-number-and-time-within-day
exports.TimeWithinDay = function (t) {
    return t % msPerDay;
};

// https://tc39.github.io/ecma262/#sec-month-number
exports.DayWithinYear = function (t) {
    return exports.Day(t) - exports.DayFromYear(exports.YearFromTime(t));
};

// https://tc39.github.io/ecma262/#sec-month-number
exports.MonthFromTime = function (t) {
    const day = exports.DayWithinYear(t);
    const leap = exports.InLeapYear(t);
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

// https://tc39.github.io/ecma262/#sec-date-number
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

// https://tc39.github.io/ecma262/#sec-timeclip
exports.TimeClip = function (time) {
    if (!Number.isFinite(time)) {
        return NaN;
    }
    if (abs(time) > 8.64e15) {
        return NaN;
    }
    return exports.ToInteger(time) + (+0);
};

// https://tc39.github.io/ecma262/#sec-maketime
exports.MakeTime = function (hour, min, sec, ms) {
    if (
        !Number.isFinite(hour) || !Number.isFinite(min) ||
        !Number.isFinite(sec) || !Number.isFinite(ms)
    ) {
        return NaN;
    }
    const h = exports.ToInteger(hour);
    const m = exports.ToInteger(min);
    const s = exports.ToInteger(sec);
    const milli = exports.ToInteger(ms);
    const t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
    return t;
};

// Utility function used in `MakeDay`.
function zeroPad(number, total) {
    const string = String(number);
    return string.length < total ?
        "0".repeat(total - string.length) + string:
        string;
}

// https://tc39.github.io/ecma262/#sec-makeday
exports.MakeDay = function (year, month, date) {
    if (
        !Number.isFinite(year) || !Number.isFinite(month) ||
        !Number.isFinite(date)
    ) {
        return NaN;
    }
    const y = exports.ToInteger(year);
    const m = exports.ToInteger(month);
    const dt = exports.ToInteger(date);
    const ym = y + floor(m / 12);
    const mn = m % 12;
    const t = Date.parse(zeroPad(ym, 4) + "-" + zeroPad(mn, 2) + "-01T00:00:00.000Z");
    if (Number_isNaN(t)) {
        return NaN;
    }
    return exports.Day(t) + dt - 1;
};

// https://tc39.github.io/ecma262/#sec-makedate
exports.MakeDate = function (day, time) {
    if (!Number.isFinite(day) || !Number.isFinite(time)) {
        return NaN;
    }
    return day * msPerDay + time;
};

// https://tc39.github.io/ecma262/#sec-getmethod
exports.GetMethod = function (O, P) {
    assert(exports.IsPropertyKey(P) === true);

    const func = exports.GetV(O, P);

    if (func === undefined || func === null) {
        return undefined;
    }

    if (exports.IsCallable(func) === false) {
        throw new TypeError("Non-callable, non-undefined method.");
    }

    return func;
};

// https://tc39.github.io/ecma262/#sec-getiterator
exports.GetIterator = function (obj) {
    const iterator = exports.Invoke(obj, atAtIterator, []);

    if (exports.Type(iterator) !== "Object") {
        throw new TypeError("Non-object iterator returned from @@iterator");
    }

    return iterator;
};

// https://tc39.github.io/ecma262/#sec-iteratornext
exports.IteratorNext = function (iterator, value) {
    const result = exports.Invoke(iterator, "next", [value]);

    if (exports.Type(result) !== "Object") {
        throw new TypeError("Result of iterator's `next` method was not an object.");
    }

    return result;
};

// https://tc39.github.io/ecma262/#sec-iteratorcomplete
exports.IteratorComplete = function (iterResult) {
    assert(exports.Type(iterResult) === "Object");

    const done = exports.Get(iterResult, "done");

    return exports.ToBoolean(done);
};

// https://tc39.github.io/ecma262/#sec-iteratorvalue
exports.IteratorValue = function (iterResult) {
    assert(exports.Type(iterResult) === "Object");

    return exports.Get(iterResult, "value");
};

// https://tc39.github.io/ecma262/#sec-iteratorstep
exports.IteratorStep = function (iterator, value) {
    const result = exports.IteratorNext(iterator, value);
    const done = exports.IteratorComplete(result);

    if (done === true) {
        return false;
    }

    return result;
};

// https://tc39.github.io/ecma262/#sec-enqueuejob
exports.EnqueueJob = function (queueName, job, args) {
    assert(exports.Type(queueName) === "String");
    assert(typeof job === "function");
    assert(Array.isArray(args) && args.length === job.length);

    process.nextTick(function () {
        job.apply(undefined, args);
    });
};

// https://tc39.github.io/ecma262/#sec-speciesconstructor
exports.SpeciesConstructor = function (O, defaultConstructor) {
    assert(exports.Type(O) === "Object");

    const C = exports.Get(O, "constructor");
    if (C === undefined) {
        return defaultConstructor;
    }
    if (exports.Type(C) !== "Object") {
        throw new TypeError("Tried to get species but the constructor property was not an object.");
    }

    const S = exports.Get(C, atAtSpecies);
    if (S === undefined || S === null) {
        return defaultConstructor;
    }

    if (exports.IsConstructor(S) === true) {
        return S;
    }

    throw new TypeError("Result of getting species was a non-constructor.");
};
