"use strict";

var assert = require("assert");
var meta = require("../meta");

describe("Meta-textual operations", function () {
    describe("assert", function () {
        it("should throw a TypeError if given a non-Boolean", function () {
            assert.throws(function () {
                meta.assert(undefined);
            }, TypeError);
        });

        it("should throw an error if given `false`", function () {
            assert.throws(function () {
                meta.assert(false);
            }, /assertion failure/);
        });

        it("should not throw if given `true`", function () {
            assert.doesNotThrow(function () {
                meta.assert(true);
            });
        })
    });

    describe("get_slot", function () {
        it("should throw an assertion error if slots have not been made for the given object", function () {
            assert.throws(function () {
                meta.get_slot({}, "boo");
            }, /assertion failure/);
        });

        it("should throw an assertion error if the given slot does not exist for the given object", function () {
            var o = {};
            meta.make_slots(o, ["slot1"]);

            assert.throws(function () {
                meta.get_slot(o, "slot2");
            }, /assertion failure/);
        });

        it("should work if the slot exists on the object", function () {
            var o = {};
            var value = { the: "value" };
            meta.make_slots(o, ["slot"]);
            meta.set_slot(o, "slot", value);

            assert.strictEqual(meta.get_slot(o, "slot"), value);
        });
    });

    describe("set_slot", function () {
        it("should throw an assertion error if slots have not been made for the given object", function () {
            assert.throws(function () {
                meta.set_slot({}, "boo");
            }, /assertion failure/);
        });

        it("should throw an assertion error if the given slot does not exist for the given object", function () {
            var o = {};
            meta.make_slots(o, ["slot1"]);

            assert.throws(function () {
                meta.set_slot(o, "slot2");
            }, /assertion failure/);
        });

        it("should change the value of an existing slot", function () {
            var o = {};
            var value = { the: "value" };
            meta.make_slots(o, ["slot"]);
            meta.set_slot(o, "slot", "starting value");
            meta.set_slot(o, "slot", value);

            assert.strictEqual(meta.get_slot(o, "slot"), value);
        });
    });

    describe("has_slot", function () {
        it("should return `false` for objects with no slots", function () {
            assert.strictEqual(meta.has_slot({}, "slot"), false);
        });

        it("should return `false` for a slot that does not exist on an object", function () {
            var o = {};
            meta.make_slots(o, ["slot1"]);

            assert.strictEqual(meta.has_slot(o, "slot2"), false);
        });

        it("should return `true` for a slot that does exist on an object", function () {
            var o = {};
            meta.make_slots(o, ["slot"]);

            assert.strictEqual(meta.has_slot(o, "slot"), true);
        });
    });

    describe("make_slots", function () {
        it("should throw an assertion error if the object already has slots", function () {
            var o = {};
            meta.make_slots(o, ["slot"]);

            assert.throws(function () {
                meta.make_slots(o, ["anotherSlot"]);
            });
        });

        it("should initialize slots to `undefined`", function () {
            var o = {};
            meta.make_slots(o, ["slot1", "slot2"]);

            assert.strictEqual(meta.get_slot(o, "slot1"), undefined);
            assert.strictEqual(meta.get_slot(o, "slot2"), undefined);
        });
    });

    describe("define_built_in_data_property", function () {
        it("should define an own property with the given value and correct property descriptor", function () {
            var o = {};
            var value = { the: "value" };
            meta.define_built_in_data_property(o, "propertyName", value);

            assert.deepEqual(Object.getOwnPropertyDescriptor(o, "propertyName"), {
                value: value,
                configurable: true,
                writable: true,
                enumerable: false
            });
        });
    });
});
