"use strict";

var abstractOperations = require("../abstract-operations");
var assert = require("assert");

describe("Abstract operations", function () {
    describe("IsCallable", function () {
        it("returns `true` for normal functions", function () {
            assert.strictEqual(abstractOperations.IsCallable(function () { }), true);
        });

        it("returns false for objects", function () {
            assert.strictEqual(abstractOperations.IsCallable({}), false)
        });

        it("returns false for `undefined`", function () {
            assert.strictEqual(abstractOperations.IsCallable(undefined), false)
        });
    });

    describe("IsConstructor", function () {
        it("returns `true` for normal functions", function () {
            assert.strictEqual(abstractOperations.IsConstructor(function () { }), true);
        });

        it("returns false for objects", function () {
            assert.strictEqual(abstractOperations.IsConstructor({}), false)
        });

        it("returns false for `undefined`", function () {
            assert.strictEqual(abstractOperations.IsConstructor(undefined), false)
        });
    });

    describe("Type", function () {
        it("returns `\"String\"` for strings", function () {
            assert.strictEqual(abstractOperations.Type(""), "String");
            assert.strictEqual(abstractOperations.Type("hi"), "String");
        });

        it("returns `\"Number\"` for numbers", function () {
            assert.strictEqual(abstractOperations.Type(0), "Number");
            assert.strictEqual(abstractOperations.Type(5), "Number");
            assert.strictEqual(abstractOperations.Type(Infinity), "Number");
            assert.strictEqual(abstractOperations.Type(-Infinity), "Number");
            assert.strictEqual(abstractOperations.Type(NaN), "Number");
        });

        it("returns `\"Boolean\"` for booleans", function () {
            assert.strictEqual(abstractOperations.Type(true), "Boolean");
            assert.strictEqual(abstractOperations.Type(false), "Boolean");
        });

        it("returns `\"Symbol\"` for symbols", function () {
            assert.strictEqual(abstractOperations.Type(Symbol()), "Symbol");
        });

        it("returns `\"Undefined\"` for `undefined`", function () {
            assert.strictEqual(abstractOperations.Type(undefined), "Undefined");
        });

        it("returns `\"Null\"` for `null`", function () {
            assert.strictEqual(abstractOperations.Type(null), "Null");
        });

        it("returns `\"Object\"` for objects, including callable objects", function () {
            assert.strictEqual(abstractOperations.Type({}), "Object");
            assert.strictEqual(abstractOperations.Type(Object.create(null)), "Object");
            assert.strictEqual(abstractOperations.Type(function () {}), "Object");
            assert.strictEqual(abstractOperations.Type(new Boolean()), "Object");
            assert.strictEqual(abstractOperations.Type(new String()), "Object");
            assert.strictEqual(abstractOperations.Type(new Number()), "Object");
            assert.strictEqual(abstractOperations.Type(new Date()), "Object");
            assert.strictEqual(abstractOperations.Type(new RegExp()), "Object");
        });
    });

    describe("IsPropertyKey", function () {
        it("returns `true` for strings", function () {
            assert.strictEqual(abstractOperations.IsPropertyKey(""), true);
            assert.strictEqual(abstractOperations.IsPropertyKey("foo"), true);
        });

        it("returns `true` for symbols", function () {
            assert.strictEqual(abstractOperations.IsPropertyKey(Symbol()), true);
        });

        it("returns `false` for any other type", function () {
            assert.strictEqual(abstractOperations.IsPropertyKey(0), false);
            assert.strictEqual(abstractOperations.IsPropertyKey(true), false);
            assert.strictEqual(abstractOperations.IsPropertyKey(undefined), false);
            assert.strictEqual(abstractOperations.IsPropertyKey(null), false);
            assert.strictEqual(abstractOperations.IsPropertyKey({}), false);
            assert.strictEqual(abstractOperations.IsPropertyKey(function () {}), false);
        });
    });

    describe("Get", function () {
        it("throws an assertion error when O is not an object", function () {
            assert.throws(function () {
                abstractOperations.Get(5, "foo");
            }, /assertion failure/);
        });

        it("throws an assertion error when P is not a property key", function () {
            assert.throws(function () {
                abstractOperations.Get({}, 0);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.Get({}, true);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.Get({}, undefined);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.Get({}, null);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.Get({}, {});
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.Get({}, function () {});
            }, /assertion failure/);
        });

        it("returns the correct value when P is a string", function () {
            var o = { key1: "value1", key2: "value2", "long key": "long value" };

            assert.strictEqual(abstractOperations.Get(o, "key1"), "value1");
            assert.strictEqual(abstractOperations.Get(o, "key2"), "value2");
            assert.strictEqual(abstractOperations.Get(o, "long key"), "long value");
            assert.strictEqual(abstractOperations.Get(o, "not there"), undefined);
        });

        it("returns the correct value when P is a symbol", function () {
            var o = {};
            var symbol = Symbol();
            var notThere = Symbol();
            o[symbol] = "value!";

            assert.strictEqual(abstractOperations.Get(o, symbol), "value!");
            assert.strictEqual(abstractOperations.Get(o, notThere), undefined);
        });
    });

    describe("SameValue", function () {
        it("returns false for different types", function () {
            assert.strictEqual(abstractOperations.SameValue(null, undefined), false);
            assert.strictEqual(abstractOperations.SameValue(5, "5"), false);
            assert.strictEqual(abstractOperations.SameValue(false, null), false);
        });

        it("returns true for two `undefined`s", function () {
            assert.strictEqual(abstractOperations.SameValue(undefined, undefined), true);
        });

        it("returns true for two `null`s", function () {
            assert.strictEqual(abstractOperations.SameValue(null, null), true);
        });

        it("returns correct results when both arguments are numbers", function () {
            assert.strictEqual(abstractOperations.SameValue(NaN, NaN), true);
            assert.strictEqual(abstractOperations.SameValue(+0, -0), false);
            assert.strictEqual(abstractOperations.SameValue(-0, +0), false);
            assert.strictEqual(abstractOperations.SameValue(5, 5), true);
            assert.strictEqual(abstractOperations.SameValue(Infinity, Infinity), true);
            assert.strictEqual(abstractOperations.SameValue(-Infinity, -Infinity), true);
            assert.strictEqual(abstractOperations.SameValue(-Infinity, +Infinity), false);
            assert.strictEqual(abstractOperations.SameValue(+Infinity, -Infinity), false);
            assert.strictEqual(abstractOperations.SameValue(5, 10), false);
        });

        it("returns correct results when both arguments are strings", function () {
            assert.strictEqual(abstractOperations.SameValue("", ""), true);
            assert.strictEqual(abstractOperations.SameValue("\u0041", "A"), true);
            assert.strictEqual(abstractOperations.SameValue("foo", "bar"), false);
        });

        it("returns correct results when both arguments are booleans", function () {
            assert.strictEqual(abstractOperations.SameValue(true, true), true);
            assert.strictEqual(abstractOperations.SameValue(false, false), true);
            assert.strictEqual(abstractOperations.SameValue(true, false), false);
            assert.strictEqual(abstractOperations.SameValue(false, true), false);
        });

        it("returns correct results when both arguments are symbols", function () {
            var symbol1 = Symbol();
            var symbol2 = Symbol();

            assert.strictEqual(abstractOperations.SameValue(symbol1, symbol1), true);
            assert.strictEqual(abstractOperations.SameValue(symbol2, symbol2), true);
            assert.strictEqual(abstractOperations.SameValue(symbol1, symbol2), false);
            assert.strictEqual(abstractOperations.SameValue(symbol2, symbol1), false);
        });

        it("returns correct results when both arguments are objects", function () {
            var o1 = { "object": true };
            var o2 = { "object": true };
            var f1 = function () { };
            var f2 = function () { };

            assert.strictEqual(abstractOperations.SameValue(o1, o1), true);
            assert.strictEqual(abstractOperations.SameValue(o2, o2), true);
            assert.strictEqual(abstractOperations.SameValue(f1, f1), true);
            assert.strictEqual(abstractOperations.SameValue(f2, f2), true);
            assert.strictEqual(abstractOperations.SameValue(o1, o2), false);
            assert.strictEqual(abstractOperations.SameValue(o2, o1), false);
            assert.strictEqual(abstractOperations.SameValue(o1, f1), false);
            assert.strictEqual(abstractOperations.SameValue(f1, f2), false);
            assert.strictEqual(abstractOperations.SameValue(f2, f1), false);
        });
    });

    describe("ArrayCreate", function () {
        it("Throws an assertion error when given non-`undefined`, non-positive integers", function () {
            assert.throws(function () {
                abstractOperations.ArrayCreate(-1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.ArrayCreate(null);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOperations.ArrayCreate({});
            }, /assertion failure/);
        });

        it("Throws a TypeError when given unsupported cases", function () {
            assert.throws(function () {
                abstractOperations.ArrayCreate(undefined);
            }, TypeError);

            assert.throws(function () {
                abstractOperations.ArrayCreate(3, {});
            }, TypeError);
        });

        it("produces an array of the specified length", function () {
            var array = abstractOperations.ArrayCreate(5);

            assert.strictEqual(array.length, 5);
        });
    });
});
