"use strict";

var abstractOps = require("../abstract-operations");
var meta = require("../meta");
var atAtCreate = require("../well-known-symbols")["@@create"];
var atAtIterator = require("../well-known-symbols")["@@iterator"];
var assert = require("assert");

function modifyGlobal(globalName) {
    var savedGlobal;

    beforeEach(function () {
        savedGlobal = global[globalName];
        global[globalName] = function () {
            throw new Error("The overriden version of the " + globalName + " global was used!");
        };
    });

    afterEach(function () {
        global[globalName] = savedGlobal;
    });
}

function modifyGlobalMethod(globalObject, methodName) {
    var savedMethod;

    beforeEach(function () {
        savedMethod = globalObject[methodName];
        globalObject[methodName] = function () {
            throw new Error("The overriden version of the " + methodName + " method was used!");
        };
    });

    afterEach(function () {
        globalObject[methodName] = savedMethod;
    });
}

describe("Abstract operations", function () {
    describe("Call", function () {
        it("throws a TypeError if given a non-callable", function () {
            assert.throws(function () {
                abstractOps.Call({}, {}, []);
            }, TypeError);

            assert.throws(function () {
                abstractOps.Call("foo", {}, []);
            }, TypeError);
        });

        it("passes no arguments if argumentsList is not given", function () {
            var argsLength;

            abstractOps.Call(function () {
                argsLength = arguments.length;
            }, undefined);

            assert.strictEqual(argsLength, 0);
        });

        it("calls with the passed thisArg", function () {
            var actualThisArg;
            var expectedThisArg = { foo: "bar" };

            abstractOps.Call(function () {
                actualThisArg = this;
            }, expectedThisArg);

            assert.strictEqual(actualThisArg, expectedThisArg);
        });

        it("calls with the passed arguments list", function () {
            var actualArg0;
            var actualArg1;
            var actualArgsLength;
            var expectedArg0 = { foo: "bar" };
            var expectedArg1 = 5;

            abstractOps.Call(function () {
                actualArg0 = arguments[0];
                actualArg1 = arguments[1];
                actualArgsLength = arguments.length;
            }, undefined, [expectedArg0, expectedArg1]);

            assert.strictEqual(actualArg0, expectedArg0);
            assert.strictEqual(actualArg1, expectedArg1);
            assert.strictEqual(actualArgsLength, 2);
        });
    });

    describe("IsCallable", function () {
        it("returns `true` for normal functions", function () {
            assert.strictEqual(abstractOps.IsCallable(function () { }), true);
        });

        it("returns false for objects", function () {
            assert.strictEqual(abstractOps.IsCallable({}), false)
        });

        it("returns false for `undefined`", function () {
            assert.strictEqual(abstractOps.IsCallable(undefined), false)
        });
    });

    describe("IsConstructor", function () {
        it("returns `true` for normal functions", function () {
            assert.strictEqual(abstractOps.IsConstructor(function () { }), true);
        });

        it("returns false for objects", function () {
            assert.strictEqual(abstractOps.IsConstructor({}), false)
        });

        it("returns false for `undefined`", function () {
            assert.strictEqual(abstractOps.IsConstructor(undefined), false)
        });
    });

    describe("Type", function () {
        it("returns `\"String\"` for strings", function () {
            assert.strictEqual(abstractOps.Type(""), "String");
            assert.strictEqual(abstractOps.Type("hi"), "String");
        });

        it("returns `\"Number\"` for numbers", function () {
            assert.strictEqual(abstractOps.Type(0), "Number");
            assert.strictEqual(abstractOps.Type(5), "Number");
            assert.strictEqual(abstractOps.Type(Infinity), "Number");
            assert.strictEqual(abstractOps.Type(-Infinity), "Number");
            assert.strictEqual(abstractOps.Type(NaN), "Number");
        });

        it("returns `\"Boolean\"` for booleans", function () {
            assert.strictEqual(abstractOps.Type(true), "Boolean");
            assert.strictEqual(abstractOps.Type(false), "Boolean");
        });

        it("returns `\"Symbol\"` for symbols", function () {
            assert.strictEqual(abstractOps.Type(Symbol()), "Symbol");
        });

        it("returns `\"Undefined\"` for `undefined`", function () {
            assert.strictEqual(abstractOps.Type(undefined), "Undefined");
        });

        it("returns `\"Null\"` for `null`", function () {
            assert.strictEqual(abstractOps.Type(null), "Null");
        });

        it("returns `\"Object\"` for objects, including callable objects", function () {
            assert.strictEqual(abstractOps.Type({}), "Object");
            assert.strictEqual(abstractOps.Type(Object.create(null)), "Object");
            assert.strictEqual(abstractOps.Type(function () {}), "Object");
            assert.strictEqual(abstractOps.Type(new Boolean()), "Object");
            assert.strictEqual(abstractOps.Type(new String()), "Object");
            assert.strictEqual(abstractOps.Type(new Number()), "Object");
            assert.strictEqual(abstractOps.Type(new Date()), "Object");
            assert.strictEqual(abstractOps.Type(new RegExp()), "Object");
        });
    });

    describe("IsPropertyKey", function () {
        it("returns `true` for strings", function () {
            assert.strictEqual(abstractOps.IsPropertyKey(""), true);
            assert.strictEqual(abstractOps.IsPropertyKey("foo"), true);
        });

        it("returns `true` for symbols", function () {
            assert.strictEqual(abstractOps.IsPropertyKey(Symbol()), true);
        });

        it("returns `false` for any other type", function () {
            assert.strictEqual(abstractOps.IsPropertyKey(0), false);
            assert.strictEqual(abstractOps.IsPropertyKey(true), false);
            assert.strictEqual(abstractOps.IsPropertyKey(undefined), false);
            assert.strictEqual(abstractOps.IsPropertyKey(null), false);
            assert.strictEqual(abstractOps.IsPropertyKey({}), false);
            assert.strictEqual(abstractOps.IsPropertyKey(function () {}), false);
        });
    });

    describe("Get", function () {
        it("throws an assertion error when O is not an object", function () {
            assert.throws(function () {
                abstractOps.Get(5, "foo");
            }, /assertion failure/);
        });

        it("throws an assertion error when P is not a property key", function () {
            assert.throws(function () {
                abstractOps.Get({}, 0);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.Get({}, true);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.Get({}, undefined);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.Get({}, null);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.Get({}, {});
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.Get({}, function () {});
            }, /assertion failure/);
        });

        it("returns the correct value when P is a string", function () {
            var o = { key1: "value1", key2: "value2", "long key": "long value" };

            assert.strictEqual(abstractOps.Get(o, "key1"), "value1");
            assert.strictEqual(abstractOps.Get(o, "key2"), "value2");
            assert.strictEqual(abstractOps.Get(o, "long key"), "long value");
            assert.strictEqual(abstractOps.Get(o, "not there"), undefined);
        });

        it("returns the correct value when P is a symbol", function () {
            var o = {};
            var symbol = Symbol();
            var notThere = Symbol();
            o[symbol] = "value!";

            assert.strictEqual(abstractOps.Get(o, symbol), "value!");
            assert.strictEqual(abstractOps.Get(o, notThere), undefined);
        });
    });

    describe("HasProperty", function () {
        it("throws an assertion error when O is not an object", function () {
            assert.throws(function () {
                abstractOps.HasProperty(5, "foo");
            }, /assertion failure/);
        });

        it("throws an assertion error when P is not a property key", function () {
            assert.throws(function () {
                abstractOps.HasProperty({}, 0);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.HasProperty({}, true);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.HasProperty({}, undefined);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.HasProperty({}, null);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.HasProperty({}, {});
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.HasProperty({}, function () {});
            }, /assertion failure/);
        });

        it("returns the correct value when P is a string", function () {
            var o = { key1: "value1", key2: "value2", "long key": "long value" };

            assert.strictEqual(abstractOps.HasProperty(o, "key1"), true);
            assert.strictEqual(abstractOps.HasProperty(o, "key2"), true);
            assert.strictEqual(abstractOps.HasProperty(o, "long key"), true);
            assert.strictEqual(abstractOps.HasProperty(o, "not there"), false);
        });

        it("returns the correct value when P is a symbol", function () {
            var o = {};
            var symbol = Symbol();
            var notThere = Symbol();
            o[symbol] = "value!";

            assert.strictEqual(abstractOps.HasProperty(o, symbol), true);
            assert.strictEqual(abstractOps.HasProperty(o, notThere), false);
        });
    });

    describe("CreateDataProperty", function () {
        it("throws an assertion error when O is not an object", function () {
            assert.throws(function () {
                abstractOps.CreateDataProperty(5, "foo", 1);
            }, /assertion failure/);
        });

        it("throws an assertion error when P is not a property key", function () {
            assert.throws(function () {
                abstractOps.CreateDataProperty({}, 0, 1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.CreateDataProperty({}, true, 1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.CreateDataProperty({}, undefined, 1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.CreateDataProperty({}, null, 1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.CreateDataProperty({}, {}, 1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.CreateDataProperty({}, function () {}, 1);
            }, /assertion failure/);
        });

        it("creates the given data property with the default attributes, when P is a string", function () {
            var o = {};

            abstractOps.CreateDataProperty(o, "key", "value");

            assert.deepEqual(Object.getOwnPropertyDescriptor(o, "key"), {
                value: "value",
                writable: true,
                enumerable: true,
                configurable: true
            });
        });

        it("creates the given data property with the default attributes, when P is a string", function () {
            var o = {};
            var symbol = Symbol();

            abstractOps.CreateDataProperty(o, symbol, "value");

            assert.deepEqual(Object.getOwnPropertyDescriptor(o, symbol), {
                value: "value",
                writable: true,
                enumerable: true,
                configurable: true
            });
        });
    });

    describe("SameValue", function () {
        it("returns false for different types", function () {
            assert.strictEqual(abstractOps.SameValue(null, undefined), false);
            assert.strictEqual(abstractOps.SameValue(5, "5"), false);
            assert.strictEqual(abstractOps.SameValue(false, null), false);
        });

        it("returns true for two `undefined`s", function () {
            assert.strictEqual(abstractOps.SameValue(undefined, undefined), true);
        });

        it("returns true for two `null`s", function () {
            assert.strictEqual(abstractOps.SameValue(null, null), true);
        });

        it("returns correct results when both arguments are numbers", function () {
            assert.strictEqual(abstractOps.SameValue(NaN, NaN), true);
            assert.strictEqual(abstractOps.SameValue(+0, -0), false);
            assert.strictEqual(abstractOps.SameValue(-0, +0), false);
            assert.strictEqual(abstractOps.SameValue(5, 5), true);
            assert.strictEqual(abstractOps.SameValue(Infinity, Infinity), true);
            assert.strictEqual(abstractOps.SameValue(-Infinity, -Infinity), true);
            assert.strictEqual(abstractOps.SameValue(-Infinity, +Infinity), false);
            assert.strictEqual(abstractOps.SameValue(+Infinity, -Infinity), false);
            assert.strictEqual(abstractOps.SameValue(5, 10), false);
        });

        it("returns correct results when both arguments are strings", function () {
            assert.strictEqual(abstractOps.SameValue("", ""), true);
            assert.strictEqual(abstractOps.SameValue("\u0041", "A"), true);
            assert.strictEqual(abstractOps.SameValue("foo", "bar"), false);
        });

        it("returns correct results when both arguments are booleans", function () {
            assert.strictEqual(abstractOps.SameValue(true, true), true);
            assert.strictEqual(abstractOps.SameValue(false, false), true);
            assert.strictEqual(abstractOps.SameValue(true, false), false);
            assert.strictEqual(abstractOps.SameValue(false, true), false);
        });

        it("returns correct results when both arguments are symbols", function () {
            var symbol1 = Symbol();
            var symbol2 = Symbol();

            assert.strictEqual(abstractOps.SameValue(symbol1, symbol1), true);
            assert.strictEqual(abstractOps.SameValue(symbol2, symbol2), true);
            assert.strictEqual(abstractOps.SameValue(symbol1, symbol2), false);
            assert.strictEqual(abstractOps.SameValue(symbol2, symbol1), false);
        });

        it("returns correct results when both arguments are objects", function () {
            var o1 = { "object": true };
            var o2 = { "object": true };
            var f1 = function () { };
            var f2 = function () { };

            assert.strictEqual(abstractOps.SameValue(o1, o1), true);
            assert.strictEqual(abstractOps.SameValue(o2, o2), true);
            assert.strictEqual(abstractOps.SameValue(f1, f1), true);
            assert.strictEqual(abstractOps.SameValue(f2, f2), true);
            assert.strictEqual(abstractOps.SameValue(o1, o2), false);
            assert.strictEqual(abstractOps.SameValue(o2, o1), false);
            assert.strictEqual(abstractOps.SameValue(o1, f1), false);
            assert.strictEqual(abstractOps.SameValue(f1, f2), false);
            assert.strictEqual(abstractOps.SameValue(f2, f1), false);
        });

        describe("with modifications to Object.is", function () {
            modifyGlobalMethod(Object, "is");

            it("should still work", function () {
                assert.strictEqual(abstractOps.SameValue(true, true), true);
            });
        });
    });

    describe("SameValueZero", function () {
        it("returns false for different types", function () {
            assert.strictEqual(abstractOps.SameValueZero(null, undefined), false);
            assert.strictEqual(abstractOps.SameValueZero(5, "5"), false);
            assert.strictEqual(abstractOps.SameValueZero(false, null), false);
        });

        it("returns true for two `undefined`s", function () {
            assert.strictEqual(abstractOps.SameValueZero(undefined, undefined), true);
        });

        it("returns true for two `null`s", function () {
            assert.strictEqual(abstractOps.SameValueZero(null, null), true);
        });

        it("returns correct results when both arguments are numbers", function () {
            assert.strictEqual(abstractOps.SameValueZero(NaN, NaN), true);
            assert.strictEqual(abstractOps.SameValueZero(+0, -0), true);
            assert.strictEqual(abstractOps.SameValueZero(-0, +0), true);
            assert.strictEqual(abstractOps.SameValueZero(5, 5), true);
            assert.strictEqual(abstractOps.SameValueZero(Infinity, Infinity), true);
            assert.strictEqual(abstractOps.SameValueZero(-Infinity, -Infinity), true);
            assert.strictEqual(abstractOps.SameValueZero(-Infinity, +Infinity), false);
            assert.strictEqual(abstractOps.SameValueZero(+Infinity, -Infinity), false);
            assert.strictEqual(abstractOps.SameValueZero(5, 10), false);
        });

        it("returns correct results when both arguments are strings", function () {
            assert.strictEqual(abstractOps.SameValueZero("", ""), true);
            assert.strictEqual(abstractOps.SameValueZero("\u0041", "A"), true);
            assert.strictEqual(abstractOps.SameValueZero("foo", "bar"), false);
        });

        it("returns correct results when both arguments are booleans", function () {
            assert.strictEqual(abstractOps.SameValueZero(true, true), true);
            assert.strictEqual(abstractOps.SameValueZero(false, false), true);
            assert.strictEqual(abstractOps.SameValueZero(true, false), false);
            assert.strictEqual(abstractOps.SameValueZero(false, true), false);
        });

        it("returns correct results when both arguments are symbols", function () {
            var symbol1 = Symbol();
            var symbol2 = Symbol();

            assert.strictEqual(abstractOps.SameValueZero(symbol1, symbol1), true);
            assert.strictEqual(abstractOps.SameValueZero(symbol2, symbol2), true);
            assert.strictEqual(abstractOps.SameValueZero(symbol1, symbol2), false);
            assert.strictEqual(abstractOps.SameValueZero(symbol2, symbol1), false);
        });

        it("returns correct results when both arguments are objects", function () {
            var o1 = { "object": true };
            var o2 = { "object": true };
            var f1 = function () { };
            var f2 = function () { };

            assert.strictEqual(abstractOps.SameValueZero(o1, o1), true);
            assert.strictEqual(abstractOps.SameValueZero(o2, o2), true);
            assert.strictEqual(abstractOps.SameValueZero(f1, f1), true);
            assert.strictEqual(abstractOps.SameValueZero(f2, f2), true);
            assert.strictEqual(abstractOps.SameValueZero(o1, o2), false);
            assert.strictEqual(abstractOps.SameValueZero(o2, o1), false);
            assert.strictEqual(abstractOps.SameValueZero(o1, f1), false);
            assert.strictEqual(abstractOps.SameValueZero(f1, f2), false);
            assert.strictEqual(abstractOps.SameValueZero(f2, f1), false);
        });

        describe("with modifications to Object.is", function () {
            modifyGlobalMethod(Object, "is");

            it("should still work", function () {
                assert.strictEqual(abstractOps.SameValueZero(true, true), true);
            });
        });
    });

    describe("ArrayCreate", function () {
        it("throws an assertion error when given non-`undefined`, non-positive integers", function () {
            assert.throws(function () {
                abstractOps.ArrayCreate(-1);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.ArrayCreate(null);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.ArrayCreate({});
            }, /assertion failure/);
        });

        it("throws a TypeError when given unsupported cases", function () {
            assert.throws(function () {
                abstractOps.ArrayCreate(undefined);
            }, TypeError);

            assert.throws(function () {
                abstractOps.ArrayCreate(3, {});
            }, TypeError);
        });

        it("produces an array of the specified length", function () {
            var array = abstractOps.ArrayCreate(5);

            assert.strictEqual(array.length, 5);
        });
    });

    describe("ObjectCreate", function () {
        it("works when no internal slots are passed", function () {
            assert.doesNotThrow(function () {
                abstractOps.ObjectCreate({});
            });
        });

        it("creates an object with the given prototype", function () {
            var proto = { the: "proto" };
            var o = abstractOps.ObjectCreate(proto);

            assert.strictEqual(Object.getPrototypeOf(o), proto);
            assert.deepEqual(Object.getOwnPropertyNames(o), []);
            assert.strictEqual(o.the, "proto");
        });

        it("creates the specified internal slots", function () {
            var o = abstractOps.ObjectCreate({}, ["slot1", "slot2"]);

            assert.strictEqual(meta.has_slot(o, "slot1"), true);
            assert.strictEqual(meta.has_slot(o, "slot2"), true);
            assert.strictEqual(meta.get_slot(o, "slot1"), undefined);
            assert.strictEqual(meta.get_slot(o, "slot2"), undefined);
        });
    });

    describe("GetPrototypeFromConstructor", function () {
        it("throws an assertion error when a non-string value is passed for intrinsicDefaultProto", function () {
            assert.throws(function () {
                abstractOps.GetPrototypeFromConstructor(function () { }, false);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.GetPrototypeFromConstructor(function () { }, {});
            }, /assertion failure/);
        });

        it("throws an assertion error when a non-intrinsic is passed for intrinsicDefaultProto", function () {
            assert.throws(function () {
                abstractOps.GetPrototypeFromConstructor(function () { }, "bloooh");
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.GetPrototypeFromConstructor(function () { }, "%Bloooh%");
            }, /assertion failure/);
        });

        it("throws a TypeError when a non-constructor is passed", function () {
            assert.throws(function () {
                abstractOps.GetPrototypeFromConstructor({}, "%ObjectPrototype%");
            }, TypeError);
        });

        it("returns the constructor's `prototype` property when it's an object", function () {
            function F1() { }
            function F2() { }
            F2.prototype = { the: "proto" };

            assert.strictEqual(abstractOps.GetPrototypeFromConstructor(F1, "%ObjectPrototype%"), F1.prototype);
            assert.strictEqual(abstractOps.GetPrototypeFromConstructor(F2, "%ObjectPrototype%"), F2.prototype);
        });

        it("returns the intrinsic default prototype if the `prototype` property is not an object", function () {
            function F1() { }
            F1.prototype = 5;

            function F2() { }
            F2.prototype = null;

            assert.strictEqual(abstractOps.GetPrototypeFromConstructor(F1, "%ObjectPrototype%"), Object.prototype);
            assert.strictEqual(abstractOps.GetPrototypeFromConstructor(F2, "%FunctionPrototype%"), Function.prototype);
        });
    });

    describe("OrdinaryCreateFromConstructor", function () {
        it("throws an assertion error when a non-string value is passed for intrinsicDefaultProto", function () {
            assert.throws(function () {
                abstractOps.OrdinaryCreateFromConstructor(function () { }, false);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.OrdinaryCreateFromConstructor(function () { }, {});
            }, /assertion failure/);
        });

        it("throws an assertion error when a non-intrinsic is passed for intrinsicDefaultProto", function () {
            assert.throws(function () {
                abstractOps.OrdinaryCreateFromConstructor(function () { }, "bloooh");
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.OrdinaryCreateFromConstructor(function () { }, "%Bloooh%");
            }, /assertion failure/);
        });

        it("creates an object with the given prototype and internal slots", function () {
            function F() { }
            F.prototype = { the: "proto" };

            var o = abstractOps.OrdinaryCreateFromConstructor(F, "%ObjectPrototype%", ["slot"]);

            assert.strictEqual(Object.getPrototypeOf(o), F.prototype);
            assert.deepEqual(Object.getOwnPropertyNames(o), []);
            assert.strictEqual(o.the, "proto");
            assert.strictEqual(meta.has_slot(o, "slot"), true);
            assert.strictEqual(meta.get_slot(o, "slot"), undefined);
        });
    });

    describe("ToObject", function () {
        it("should throw a TypeError for `undefined`", function () {
            assert.throws(function () {
                abstractOps.ToObject(undefined);
            }, TypeError);
        });

        it("should throw a TypeError for `null`", function () {
            assert.throws(function () {
                abstractOps.ToObject(null);
            }, TypeError);
        });

        it("should give a wrapper object for booleans", function () {
            var t = abstractOps.ToObject(true);
            var f = abstractOps.ToObject(false);

            assert.strictEqual(typeof t, "object");
            assert.strictEqual(t.valueOf(), true);
            assert.strictEqual(typeof f, "object");
            assert.strictEqual(f.valueOf(), false);
        });

        it("should give a wrapper object for numbers", function () {
            var five = abstractOps.ToObject(5);
            var infinity = abstractOps.ToObject(Infinity);

            assert.strictEqual(typeof five, "object");
            assert.strictEqual(five.valueOf(), 5);
            assert.strictEqual(typeof infinity, "object");
            assert.strictEqual(infinity.valueOf(), Infinity);
        });

        it("should give a wrapper object for strings", function () {
            var five = abstractOps.ToObject("five");
            var infinity = abstractOps.ToObject("infinity");

            assert.strictEqual(typeof five, "object");
            assert.strictEqual(five.valueOf(), "five");
            assert.strictEqual(typeof infinity, "object");
            assert.strictEqual(infinity.valueOf(), "infinity");
        });

        it("should give a wrapper object for symbols", function () {
            var symbol = Symbol();
            var wrappedSymbol = abstractOps.ToObject(symbol);

            assert.strictEqual(typeof wrappedSymbol, "object");
            assert.strictEqual(wrappedSymbol.valueOf(), symbol);
        });

        it("should return the object for objects", function () {
            var o = {};
            var wrappedO = abstractOps.ToObject(o);

            var f = {};
            var wrappedF = abstractOps.ToObject(f);

            assert.strictEqual(wrappedO, o);
            assert.strictEqual(wrappedF, f);
        });

        describe("with modifications to the global Object constructor", function () {
            modifyGlobal("Object");

            it("should still work", function () {
                var o = {};
                var wrappedO = abstractOps.ToObject(o);
                assert.strictEqual(wrappedO, o);
            });
        });
    });

    describe("ToBoolean", function () {
        it("should return `false` for `undefined`", function () {
            assert.strictEqual(abstractOps.ToBoolean(undefined), false);
        });

        it("should return `false` for `null`", function () {
            assert.strictEqual(abstractOps.ToBoolean(null), false);
        });

        it("should return the input for a boolean", function () {
            assert.strictEqual(abstractOps.ToBoolean(true), true);
            assert.strictEqual(abstractOps.ToBoolean(false), false);
        });

        it("should return `false` for `+0`, `-0`, and `NaN`, but `true` other numbers", function () {
            assert.strictEqual(abstractOps.ToBoolean(+0), false);
            assert.strictEqual(abstractOps.ToBoolean(-0), false);
            assert.strictEqual(abstractOps.ToBoolean(NaN), false);
            assert.strictEqual(abstractOps.ToBoolean(1), true);
            assert.strictEqual(abstractOps.ToBoolean(-1), true);
            assert.strictEqual(abstractOps.ToBoolean(-Infinity), true);
        });

        it("should return `false` for empty strings, but `true` for other strings", function () {
            assert.strictEqual(abstractOps.ToBoolean(""), false);
            assert.strictEqual(abstractOps.ToBoolean(" "), true);
            assert.strictEqual(abstractOps.ToBoolean("false"), true);
        });

        it("should return `true` for symbols", function () {
            assert.strictEqual(abstractOps.ToBoolean(Symbol()), true);
        });

        it("should return `true` for objects", function () {
            assert.strictEqual(abstractOps.ToBoolean({}), true);
            assert.strictEqual(abstractOps.ToBoolean(Object.create(null)), true);
            assert.strictEqual(abstractOps.ToBoolean(function () { }), true);
            assert.strictEqual(abstractOps.ToBoolean(new Boolean(false)), true);
            assert.strictEqual(abstractOps.ToBoolean(new Number(0)), true);
        });

        describe("with modifications to the global Boolean constructor", function () {
            modifyGlobal("Boolean");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToBoolean(" "), true);
            });
        });
    });

    describe("ToNumber", function () {
        it("should return `NaN` for `undefined`", function () {
            var value = abstractOps.ToNumber(undefined);
            assert.ok(typeof value === "number");
            assert.ok(isNaN(value));
        });

        it("should return `+0` for `null`", function () {
            var value = abstractOps.ToNumber(null);
            assert.strictEqual(value, +0);
            assert.strictEqual(+Infinity/value, +Infinity);
        });

        it("should return `1` for `true`", function () {
            assert.strictEqual(abstractOps.ToNumber(true), 1);
        });

        it("should return `0` for `false`", function () {
            var value = abstractOps.ToNumber(false);
            assert.strictEqual(value, +0);
            assert.strictEqual(+Infinity/value, +Infinity);
        });

        it("should be the identity for numbers", function () {
            assert.strictEqual(abstractOps.ToNumber(-1), -1);
            assert.strictEqual(abstractOps.ToNumber(+1), +1);
            assert.strictEqual(abstractOps.ToNumber(-Infinity), -Infinity);
            assert.strictEqual(abstractOps.ToNumber(+Infinity), +Infinity);

            var plusZero = abstractOps.ToNumber(+0);
            assert.strictEqual(plusZero, +0);
            assert.strictEqual(+Infinity/plusZero, +Infinity);

            var minusZero = abstractOps.ToNumber(-0);
            assert.strictEqual(minusZero, -0);
            assert.strictEqual(+Infinity/minusZero, -Infinity);
        });

        it("should give back the correct number from strings", function () {
            var asdfResult = abstractOps.ToNumber("asdf");
            assert.ok(typeof asdfResult === "number");
            assert.ok(isNaN(asdfResult));

            assert.strictEqual(abstractOps.ToNumber("123"), 123);
            assert.strictEqual(abstractOps.ToNumber("-123"), -123);
            assert.strictEqual(abstractOps.ToNumber("1e5"), 1e5);

            // I got lazy, sorry
        });

        it("should throw a TypeError for a symbol", function () {
            assert.throws(function () {
                abstractOps.ToNumber(new Symbol());
            }, TypeError);
        });

        describe("with modifications to the global Number constructor", function () {
            modifyGlobal("Number");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToNumber("123"), 123);
            });
        });
    });

    describe("ToInteger", function () {
        it("should return `+0` for `NaN`", function () {
            var result = abstractOps.ToInteger(NaN);
            assert.strictEqual(result, +0);
            assert.strictEqual(+Infinity/result, +Infinity);
        });

        it("should return the input for +0, -0, +Infinity, -Infinity", function () {
            var plusZero = abstractOps.ToInteger(+0);
            assert.strictEqual(plusZero, +0);
            assert.strictEqual(+Infinity/plusZero, +Infinity);

            var minusZero = abstractOps.ToInteger(-0);
            assert.strictEqual(minusZero, -0);
            assert.strictEqual(+Infinity/minusZero, -Infinity);

            assert.strictEqual(abstractOps.ToInteger(+Infinity), +Infinity);
            assert.strictEqual(abstractOps.ToInteger(-Infinity), -Infinity);
        });

        it("should give back the integer version for other numbers", function () {
            assert.strictEqual(abstractOps.ToInteger(1), 1);
            assert.strictEqual(abstractOps.ToInteger(1.5), 1);
            assert.strictEqual(abstractOps.ToInteger(1.999), 1);
            assert.strictEqual(abstractOps.ToInteger(-1.2), -1);
            assert.strictEqual(abstractOps.ToInteger(-1.999), -1);
        });

        it("should work correctly on non-numbers", function () {
            assert.strictEqual(abstractOps.ToInteger("-1.999"), -1);
            assert.strictEqual(abstractOps.ToInteger("asdf"), 0);
            assert.strictEqual(abstractOps.ToInteger({}), 0);
        });

        describe("with modifications to Number.isNaN", function () {
            modifyGlobalMethod(Number, "isNaN");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToInteger(NaN), +0);
            });
        });

        describe("with modifications to Math.abs", function () {
            modifyGlobalMethod(Math, "abs");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToInteger("123"), 123);
            });
        });

        describe("with modifications to Math.floor", function () {
            modifyGlobalMethod(Math, "floor");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToInteger("123"), 123);
            });
        });

        describe("with modifications to the global isNaN function", function () {
            modifyGlobal("isNaN");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToInteger("123"), 123);
            });
        });
    });

    describe("ToLength", function () {
        it("should return +0 for things below zero", function () {
            var result1 = abstractOps.ToLength(-1);
            assert.strictEqual(result1, +0);
            assert.strictEqual(+Infinity/result1, +Infinity);

            var result2 = abstractOps.ToLength(-Infinity);
            assert.strictEqual(result2, +0);
            assert.strictEqual(+Infinity/result2, +Infinity);

            var result3 = abstractOps.ToLength(-0);
            assert.strictEqual(result3, +0);
            assert.strictEqual(+Infinity/result3, +Infinity);
        });

        it("should return 2^53 - 1 for numbers above 2^53 - 1", function () {
            assert.strictEqual(abstractOps.ToLength(Math.pow(2, 53)), Math.pow(2, 53) - 1);
            assert.strictEqual(abstractOps.ToLength(Math.pow(2, 55)), Math.pow(2, 53) - 1);
            assert.strictEqual(abstractOps.ToLength(+Infinity), Math.pow(2, 53) - 1);
        });

        it("should return the input for numbers between 0 and 2^53 - 1", function () {
            assert.strictEqual(abstractOps.ToLength(Math.pow(2, 52)), Math.pow(2, 52));
            assert.strictEqual(abstractOps.ToLength(Math.pow(2, 53) - 3), Math.pow(2, 53) - 3);
        });

        describe("with modifications to Math.min", function () {
            modifyGlobalMethod(Math, "min");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToLength("123"), 123);
            });
        });

        describe("with modifications to Math.pow", function () {
            modifyGlobalMethod(Math, "pow");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToLength("123"), 123);
            });
        });
    });

    describe("ToString", function () {
        it("should return `\"undefined\"` for `undefined`", function () {
            assert.strictEqual(abstractOps.ToString(undefined), "undefined");
        });

        it("should return `\"null\"` for `null`", function () {
            assert.strictEqual(abstractOps.ToString(null), "null");
        });

        it("should return `\"true\"` for `true`", function () {
            assert.strictEqual(abstractOps.ToString(true), "true");
        });

        it("should return `\"false\"` for `false`", function () {
            assert.strictEqual(abstractOps.ToString(false), "false");
        });

        it("should return the correct number formatting for numbers", function () {
            assert.strictEqual(abstractOps.ToString(NaN), "NaN");
            assert.strictEqual(abstractOps.ToString(+0), "0");
            assert.strictEqual(abstractOps.ToString(-0), "0");
            assert.strictEqual(abstractOps.ToString(+Infinity), "Infinity");
            assert.strictEqual(abstractOps.ToString(-Infinity), "-Infinity");
            assert.strictEqual(abstractOps.ToString(10), "10");
            assert.strictEqual(abstractOps.ToString(-10), "-10");
        });

        it("should return the input for a string", function () {
            assert.strictEqual(abstractOps.ToString(""), "");
            assert.strictEqual(abstractOps.ToString("whee"), "whee");
        });

        it("should throw a TypeError for a symbol", function () {
            assert.throws(function () {
                abstractOps.ToString(new Symbol());
            }, TypeError);
        });

        it("should prefer toString to valueOf on objects", function () {
            var o = { valueOf: function () { return 5; }, toString: function () { return "foo"; } };
            assert.strictEqual(abstractOps.ToString(o), "foo");
        });

        describe("with modifications to the global String constructor", function () {
            modifyGlobal("String");

            it("should still work", function () {
                assert.strictEqual(abstractOps.ToString(10), "10");
            });
        });
    });

    describe("TimeFromYear", function () {
        it("should return the time value of the start of a year", function () {
            assert.strictEqual(abstractOps.TimeFromYear(2013), 1356998400000);
            assert.strictEqual(abstractOps.TimeFromYear(2014), 1388534400000);
            assert.strictEqual(abstractOps.TimeFromYear(2015), 1420070400000);
        });
    });

    describe("DayFromYear", function () {
        it("should return the day number of the first day of a year", function () {
            assert.strictEqual(abstractOps.DayFromYear(2013), 15706);
            assert.strictEqual(abstractOps.DayFromYear(2014), 16071);
            assert.strictEqual(abstractOps.DayFromYear(2015), 16436);
        });
    });

    describe("YearFromTime", function () {
        it("should return the year for a given time value", function () {
            assert.strictEqual(abstractOps.YearFromTime(580476817000), 1988);
            assert.strictEqual(abstractOps.YearFromTime(1407414804814), 2014);
            assert.strictEqual(abstractOps.YearFromTime(1609455359000), 2020);
        });
    });

    describe("DaysInYear", function () {
        it("should return the number of days in a year", function () {
            assert.strictEqual(abstractOps.DaysInYear(2000), 366);
            assert.strictEqual(abstractOps.DaysInYear(2013), 365);
            assert.strictEqual(abstractOps.DaysInYear(2014), 365);
            assert.strictEqual(abstractOps.DaysInYear(2015), 365);
            assert.strictEqual(abstractOps.DaysInYear(2016), 366);
        });
    });

    describe("InLeapYear", function () {
        it("should return `1` for a time value in a leap year and `0` otherwise", function () {
            assert.strictEqual(abstractOps.InLeapYear(950445217000), 1);
            assert.strictEqual(abstractOps.InLeapYear(1360758817000), 0);
            assert.strictEqual(abstractOps.InLeapYear(1392294817000), 0);
            assert.strictEqual(abstractOps.InLeapYear(1423830817000), 0);
            assert.strictEqual(abstractOps.InLeapYear(1455366817000), 1);
        });
    });

    describe("Day", function () {
        it("should return the day number of a time value", function () {
            assert.strictEqual(abstractOps.Day(950445217000), 11000);
            assert.strictEqual(abstractOps.Day(1360758817000), 15749);
            assert.strictEqual(abstractOps.Day(1392294817000), 16114);
            assert.strictEqual(abstractOps.Day(1423830817000), 16479);
            assert.strictEqual(abstractOps.Day(1455366817000), 16844);
        });
    });

    describe("TimeWithinDay", function () {
        it("should return the time value within a day for a time value", function () {
            assert.strictEqual(abstractOps.TimeWithinDay(950445217000), 45217000);
            assert.strictEqual(abstractOps.TimeWithinDay(1360758817000), 45217000);
            assert.strictEqual(abstractOps.TimeWithinDay(1392294817000), 45217000);
            assert.strictEqual(abstractOps.TimeWithinDay(1423830817000), 45217000);
            assert.strictEqual(abstractOps.TimeWithinDay(1455397312000), 75712000);
        });
    });

    describe("DayWithinYear", function () {
        it("should return the day number within a year for a given time value", function () {
            assert.strictEqual(abstractOps.DayWithinYear(946730017000), 0);
            assert.strictEqual(abstractOps.DayWithinYear(946816417000), 1);
            assert.strictEqual(abstractOps.DayWithinYear(946902817000), 2);
            assert.strictEqual(abstractOps.DayWithinYear(950445217000), 43);
            assert.strictEqual(abstractOps.DayWithinYear(978217200000), 364);
            assert.strictEqual(abstractOps.DayWithinYear(1360758817000), 43);
            assert.strictEqual(abstractOps.DayWithinYear(1392294817000), 43);
            assert.strictEqual(abstractOps.DayWithinYear(1419980400000), 363);
            assert.strictEqual(abstractOps.DayWithinYear(1423830817000), 43);
            assert.strictEqual(abstractOps.DayWithinYear(1455397312000), 43);
        });
    });

    describe("MonthFromTime", function () {
        it("should return the month number for a given time value", function () {
            assert.strictEqual(abstractOps.MonthFromTime(946730017000), 0);
            assert.strictEqual(abstractOps.MonthFromTime(950445217000), 1);
            assert.strictEqual(abstractOps.MonthFromTime(951914017000), 2);
            assert.strictEqual(abstractOps.MonthFromTime(978217200000), 11);
            assert.strictEqual(abstractOps.MonthFromTime(1360758817000), 1);
        });
    });

    describe("DateFromTime", function () {
        it("should return the date number for a given time value", function () {
            assert.strictEqual(abstractOps.DateFromTime(946684800000), 1);
            assert.strictEqual(abstractOps.DateFromTime(946730017000), 1);
            assert.strictEqual(abstractOps.DateFromTime(946816417000), 2);
            assert.strictEqual(abstractOps.DateFromTime(946902817000), 3);
            assert.strictEqual(abstractOps.DateFromTime(949276800000), 31);
            assert.strictEqual(abstractOps.DateFromTime(950445217000), 13);
            assert.strictEqual(abstractOps.DateFromTime(978217200000), 30);
            assert.strictEqual(abstractOps.DateFromTime(1009753200000), 30);
            assert.strictEqual(abstractOps.DateFromTime(1360758817000), 13);
            assert.strictEqual(abstractOps.DateFromTime(1419980400000), 30);
            assert.strictEqual(abstractOps.DateFromTime(1423830817000), 13);
        });
    });

    describe("TimeClip", function () {
        it("should return a number of milliseconds for a valid time value, or `NaN` otherwise", function () {
            assert.strictEqual(abstractOps.TimeClip(946684800000), 946684800000);
            assert.ok(isNaN(abstractOps.TimeClip(-Infinity)));
            assert.ok(isNaN(abstractOps.TimeClip(+Infinity)));
            assert.ok(isNaN(abstractOps.TimeClip(-8.64e15 - 1)));
            assert.ok(isNaN(abstractOps.TimeClip(+8.64e15 + 1)));
        });
    });

    describe("MakeTime", function () {
        it("should return a number of milliseconds from its arguments, or `NaN` in case of an error", function () {
            assert.strictEqual(abstractOps.MakeTime(0, 0, 0, 1), 1);
            assert.strictEqual(abstractOps.MakeTime(13, 33, 33, 37), 48813037);
            assert.ok(isNaN(abstractOps.MakeTime(-Infinity, -Infinity, -Infinity, -Infinity)));
            assert.ok(isNaN(abstractOps.MakeTime(+Infinity, +Infinity, +Infinity, +Infinity)));
        });
    });

    describe("MakeDay", function () {
        it("should return a number of days from its arguments, or `NaN` in case of an error", function () {
            assert.strictEqual(abstractOps.MakeDay(1970, 1, 1), 0);
            assert.strictEqual(abstractOps.MakeDay(1970, 1, 2), 1);
            assert.strictEqual(abstractOps.MakeDay(2014, 8, 9), 16291);
            assert.strictEqual(isNaN(abstractOps.MakeDay(-Infinity, -Infinity, -Infinity)), isNaN(NaN));
            assert.strictEqual(isNaN(abstractOps.MakeDay(+Infinity, +Infinity, +Infinity)), isNaN(NaN));
        });
    });

    describe("MakeDate", function () {
        it("should return a number of milliseconds from its arguments, or `NaN` in case of an error", function () {
            assert.strictEqual(abstractOps.MakeDate(16291, 48813037), 1407591213037);
            assert.strictEqual(isNaN(abstractOps.MakeDate(-Infinity, -Infinity)), isNaN(NaN));
            assert.strictEqual(isNaN(abstractOps.MakeDate(+Infinity, +Infinity)), isNaN(NaN));
        });
    });

    describe("GetMethod", function () {
        it("should throw an assertion error when used on a non-object", function () {
            assert.throws(function () {
                abstractOps.GetMethod(5, "valueOf");
            }, /assertion failure/);
        });

        it("should throw an assertion error when used with a non-property key", function () {
            assert.throws(function () {
                abstractOps.GetMethod({}, 5);
            }, /assertion failure/);
        });

        it("should return undefined methods as `undefined`", function () {
            var symbol = Symbol();

            assert.strictEqual(abstractOps.GetMethod({}, "foo"), undefined);
            assert.strictEqual(abstractOps.GetMethod({}, symbol), undefined);
        });

        it("should return null methods as `undefined`", function () {
            var symbol = Symbol();

            assert.strictEqual(abstractOps.GetMethod({ foo: null }, "foo"), undefined);
        });

        it("should return callable methods", function () {
            var symbol = Symbol();

            var method1 = function () { };
            var method2 = function () { };
            var o = { foo: method1 };
            o[symbol] = method2;

            assert.strictEqual(abstractOps.GetMethod(o, "foo"), method1);
            assert.strictEqual(abstractOps.GetMethod(o, symbol), method2);
        });

        it("should throw a TypeError for non-callable methods", function () {
            var o = { foo: "bar" };

            assert.throws(function () {
                abstractOps.GetMethod(o, "foo");
            }, TypeError);
        });
    });

    describe("Invoke", function () {
        it("should throw an assertion error when used with a non-property key", function () {
            assert.throws(function () {
                abstractOps.Invoke({}, 5);
            }, /assertion failure/);
        });

        it("should throw a TypeError when used with an undefined method", function () {
            assert.throws(function () {
                abstractOps.Invoke({}, "method");
            }, TypeError);
        });

        it("calls the method with the given arguments and correct `this`", function () {
            var recordedThis;
            var recordedArgs;
            var o = {
                method: function () {
                    recordedThis = this;
                    recordedArgs = arguments;
                }
            };

            abstractOps.Invoke(o, "method", [1, 2, 3]);

            assert.strictEqual(recordedThis, o);
            assert.deepEqual(Array.prototype.slice.call(recordedArgs), [1, 2, 3]);
        });

        it("calls the method with no arguments if arguments are omitted", function () {
            var recordedThis;
            var recordedArgs;
            var o = {
                method: function () {
                    recordedThis = this;
                    recordedArgs = arguments;
                }
            };

            abstractOps.Invoke(o, "method");

            assert.strictEqual(recordedThis, o);
            assert.deepEqual(Array.prototype.slice.call(recordedArgs), []);
        });
    });

    describe("GetIterator", function () {
        it("should get the iterator", function () {
            var o = {};
            var iterator = { the: "iterator" };
            o[atAtIterator] = function () { return iterator; };

            assert.strictEqual(abstractOps.GetIterator(o), iterator);
        });

        it("should get the iterator even if the iterator is a function", function () {
            var o = {};
            var iterator = function () { };
            o[atAtIterator] = function () { return iterator; };

            assert.strictEqual(abstractOps.GetIterator(o), iterator);
        });

        it("should throw a TypeError if a non-object iterator is returned", function () {
            var o = {};
            o[atAtIterator] = function () { return 5; };

            assert.throws(function () {
                abstractOps.GetIterator(o);
            }, TypeError);
        });

        it("should throw a TypeError if there is no iterator", function () {
            var o = {};

            assert.throws(function () {
                abstractOps.GetIterator(o);
            }, TypeError);
        });

        it("should throw a TypeError if the @@iterator property is not a method", function () {
            var o = {};
            o[atAtIterator] = 5;

            assert.throws(function () {
                abstractOps.GetIterator(o);
            }, TypeError);
        });
    });

    describe("IteratorNext", function () {
        it("should get the result of the `next()` method, if it's an object", function () {
            var result = { the: "result" };
            var iterator = { next: function () { return result; } };

            assert.strictEqual(abstractOps.IteratorNext(iterator), result);
        });

        it("should work with `this`-dependent `next()` methods", function () {
            var iterator = { next: function () { return this; } };

            assert.strictEqual(abstractOps.IteratorNext(iterator), iterator);
        });

        it("should work with argument-dependent `next(value)` methods", function () {
            var iterator = { next: function (value) { return { plusFive: value + 5 }; } };

            assert.deepEqual(abstractOps.IteratorNext(iterator, 5), { plusFive: 10 });
        });

        it("should throw a TypeError if the `next()` method returns a non-object", function () {
            var iterator = { next: function () { return 5; } };

            assert.throws(function () {
                abstractOps.IteratorNext(iterator);
            });
        });
    });

    describe("IteratorComplete", function () {
        it("should throw an assertion error for non-object arguments", function () {
            assert.throws(function () {
                abstractOps.IteratorComplete(5);
            }, /assertion failure/);
        });

        it("should get the `done` property and convert it to a boolean", function () {
            var noProps = {};
            var doneTrue = { done: true };
            var doneFalse = { done: false };
            var doneTruthy = { done: 1 };
            var doneFalsy = { done: NaN };
            var doneGetTruthy = { get done() { return {}; } }
            var doneGetFalsy = { get done() { return ""; } };

            assert.strictEqual(abstractOps.IteratorComplete(noProps), false);
            assert.strictEqual(abstractOps.IteratorComplete(doneTrue), true);
            assert.strictEqual(abstractOps.IteratorComplete(doneFalse), false);
            assert.strictEqual(abstractOps.IteratorComplete(doneTruthy), true);
            assert.strictEqual(abstractOps.IteratorComplete(doneFalsy), false);
            assert.strictEqual(abstractOps.IteratorComplete(doneGetTruthy), true);
            assert.strictEqual(abstractOps.IteratorComplete(doneGetFalsy), false);
        });
    });

    describe("IteratorValue", function () {
        it("should throw an assertion error for non-object arguments", function () {
            assert.throws(function () {
                abstractOps.IteratorValue(5);
            }, /assertion failure/);
        });

        it("should get the `done` property and convert it to a boolean", function () {
            var value = { the: "value" };

            var noProps = {};
            var valueTrue = { value: true };
            var value1 = { value: 1 };
            var valueObject = { value: value };
            var valueGetTrue = { get value() { return true; } }
            var valueGet1 = { get value() { return 1; } };
            var valueGetObject = { get value() { return value; } };

            assert.strictEqual(abstractOps.IteratorValue(noProps), undefined);
            assert.strictEqual(abstractOps.IteratorValue(valueTrue), true);
            assert.strictEqual(abstractOps.IteratorValue(value1), 1);
            assert.strictEqual(abstractOps.IteratorValue(valueObject), value);
            assert.strictEqual(abstractOps.IteratorValue(valueGetTrue), true);
            assert.strictEqual(abstractOps.IteratorValue(valueGet1), 1);
            assert.strictEqual(abstractOps.IteratorValue(valueGetObject), value);
        });
    });

    describe("IteratorStep", function () {
        it("should return the iterator result as long as `done` is not falsy", function () {
            var iterator = {
                next: function (arg) {
                    return {
                        value: this[arg] + 5,
                        done: arg === "whee" ? 1 : 0
                    };
                },
                prop1: 4,
                prop2: 7,
                whee: -1
            };

            assert.deepEqual(abstractOps.IteratorStep(iterator, "prop1"), { value: 9, done: 0 });
            assert.deepEqual(abstractOps.IteratorStep(iterator, "prop2"), { value: 12, done: 0 });
            assert.deepEqual(abstractOps.IteratorStep(iterator, "prop1"), { value: 9, done: 0 });
            assert.deepEqual(abstractOps.IteratorStep(iterator, "whee"), false);
        });
    });

    describe("EnqueueJob", function () {
        it("should throw an assertion error for non-string queue names", function () {
            assert.throws(function () {
                abstractOps.EnqueueJob(5, function () {}, []);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.EnqueueJob(null, function () {}, []);
            }, /assertion failure/);
        });

        it("should throw an assertion error for non-function tasks", function () {
            assert.throws(function () {
                abstractOps.EnqueueJob("PromiseTasks", {}, []);
            }, /assertion failure/);
        });

        it("should throw an assertion error for non-array arguments", function () {
            assert.throws(function () {
                abstractOps.EnqueueJob("PromiseTasks", function () { }, {});
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.EnqueueJob("PromiseTasks", function () { }, null);
            }, /assertion failure/);
        });

        it("should throw an assertion error if the arguments do not match the task's expectations", function () {
            assert.throws(function () {
                abstractOps.EnqueueJob("PromiseTasks", function (a) { }, []);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.EnqueueJob("PromiseTasks", function () { }, [1]);
            }, /assertion failure/);
        });

        it("should run on a new execution context", function (done) {
            var counter = 0;
            abstractOps.EnqueueJob("PromiseTasks", function () {
                assert.strictEqual(counter, 1);
                done();
            }, []);
            ++counter;
        });
    });
});
