"use strict";

var abstractOps = require("../abstract-operations");
var meta = require("../meta");
var atAtCreate = require("../well-known-symbols")["@@create"];
var atAtIterator = require("../well-known-symbols")["@@iterator"];
var assert = require("assert");

describe("Abstract operations", function () {
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

    describe("CreateFromConstructor", function () {
        it("should return undefined for functions without @@create values", function () {
            function F() { }

            assert.strictEqual(abstractOps.CreateFromConstructor(F), undefined);
        });

        it("should throw a TypeError for non-callable @@create values", function () {
            function F() { }
            F[atAtCreate] = {};

            assert.throws(function () {
                abstractOps.CreateFromConstructor(F, []);
            }, TypeError);
        });

        it("should throw a TypeError for @@creates that return non-objects", function () {
            function F() { }
            F[atAtCreate] = function () { return 5; };

            assert.throws(function () {
                abstractOps.CreateFromConstructor(F, []);
            }, TypeError);
        });

        it("should work with `this`-dependent @@creates", function () {
            function F() {}
            F[atAtCreate] = function () {
                return { shouldBeF: this };
            };

            var o = abstractOps.CreateFromConstructor(F, []);

            assert.strictEqual(o.shouldBeF, F);
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

    describe("OrdinaryConstruct", function () {
        it("should throw a TypeError for non-callable @@create values", function () {
            function F() { }
            F[atAtCreate] = {};

            assert.throws(function () {
                abstractOps.OrdinaryConstruct(F, []);
            }, TypeError);
        });

        it("should throw a TypeError for @@creates that return non-objects", function () {
            function F() { }
            F[atAtCreate] = function () { return 5; };

            assert.throws(function () {
                abstractOps.OrdinaryConstruct(F, []);
            }, TypeError);
        });

        it("should return the constructed object for non-object return values", function () {
            function F(arg) {
                this.arg = arg;

                return 5;
            }
            F.prototype.foo = "bar";

            var o = abstractOps.OrdinaryConstruct(F, [10]);

            assert(o.hasOwnProperty("arg"));
            assert.strictEqual(o.arg, 10);
            assert.strictEqual(Object.getPrototypeOf(o), F.prototype);
            assert.strictEqual(o.foo, "bar");
        });

        it("should return the constructed object for no return value", function () {
            function F(arg) {
                this.arg = arg;
            }
            F.prototype.foo = "bar";

            var o = abstractOps.OrdinaryConstruct(F, [10]);

            assert(o.hasOwnProperty("arg"));
            assert.strictEqual(o.arg, 10);
            assert.strictEqual(Object.getPrototypeOf(o), F.prototype);
            assert.strictEqual(o.foo, "bar");
        });

        it("should return the returned object for object return values", function () {
            var value = { the: "value" };
            function F(arg) {
                this.arg = arg;

                return value;
            }
            F.prototype.foo = "bar";

            var o = abstractOps.OrdinaryConstruct(F, [10]);

            assert.strictEqual(o, value);
            assert(!o.hasOwnProperty("arg"));
            assert.strictEqual(o.arg, undefined);
            assert.strictEqual(Object.getPrototypeOf(o), Object.prototype);
            assert.strictEqual(o.foo, undefined);
        });

        it("should use Object.prototype when the constructor has a primitive as its `prototype` property", function () {
            function F(arg) {
                this.arg = arg;
            }
            F.prototype = "bar";

            var o = abstractOps.OrdinaryConstruct(F, [10]);

            assert(o.hasOwnProperty("arg"));
            assert.strictEqual(o.arg, 10);
            assert.strictEqual(Object.getPrototypeOf(o), Object.prototype);
        });

        it("should use @@create if present", function () {
            function F(arg) {
                this.arg = arg;
            }
            F.prototype.foo = "bar";
            F[atAtCreate] = function () {
                return { initial: "stuff" };
            };

            var o = abstractOps.OrdinaryConstruct(F, [10]);

            assert(o.hasOwnProperty("arg"));
            assert.strictEqual(o.arg, 10);

            assert.strictEqual(Object.getPrototypeOf(o), Object.prototype);
            assert.strictEqual(o.foo, undefined);

            assert(o.hasOwnProperty("initial"));
            assert.strictEqual(o.initial, "stuff");
        });

        it("should work with `this`-dependent @@creates", function () {
            function F() {}
            F[atAtCreate] = function () {
                return { shouldBeF: this };
            };

            var o = abstractOps.OrdinaryConstruct(F, []);

            assert.strictEqual(o.shouldBeF, F);
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

    describe("EnqueueTask", function () {
        it("should throw an assertion error for non-string queue names", function () {
            assert.throws(function () {
                abstractOps.EnqueueTask(5, function () {}, []);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.EnqueueTask(null, function () {}, []);
            }, /assertion failure/);
        });

        it("should throw an assertion error for non-function tasks", function () {
            assert.throws(function () {
                abstractOps.EnqueueTask("PromiseTasks", {}, []);
            }, /assertion failure/);
        });

        it("should throw an assertion error for non-array arguments", function () {
            assert.throws(function () {
                abstractOps.EnqueueTask("PromiseTasks", function () { }, {});
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.EnqueueTask("PromiseTasks", function () { }, null);
            }, /assertion failure/);
        });

        it("should throw an assertion error if the arguments do not match the task's expectations", function () {
            assert.throws(function () {
                abstractOps.EnqueueTask("PromiseTasks", function (a) { }, []);
            }, /assertion failure/);

            assert.throws(function () {
                abstractOps.EnqueueTask("PromiseTasks", function () { }, [1]);
            }, /assertion failure/);
        });

        it("should run on a new execution context", function (done) {
            var counter = 0;
            abstractOps.EnqueueTask("PromiseTasks", function () {
                assert.strictEqual(counter, 1);
                done();
            }, []);
            ++counter;
        });
    });
});
