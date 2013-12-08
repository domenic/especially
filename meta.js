"use strict";

// Exports meta-level operations, i.e. things that are only specified textually in the ECMAScript specification.

let slotsMap = new WeakMap();

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-algorithm-conventions
exports.assert = function (condition) {
    if (condition !== true && condition !== false) {
        throw new TypeError("Assertions should be only of booleans; you're writing your spec wrong.");
    }

    if (!condition) {
        throw new Error("Specification-level assertion failure");
    }
};

// Slots: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object-internal-methods-and-internal-slots

exports.make_slots = function (obj, names) {
    exports.assert(!slotsMap.has(obj));

    let slots = Object.create(null);
    names.forEach(function (name) {
        slots[name] = undefined;
    });

    slotsMap.set(obj, slots);
};

exports.get_slot = function (obj, name) {
    exports.assert(slotsMap.has(obj));
    exports.assert(name in slotsMap.get(obj));

    return slotsMap.get(obj)[name];
};

exports.set_slot = function (obj, name, value) {
    exports.assert(slotsMap.has(obj));
    exports.assert(name in slotsMap.get(obj));

    slotsMap.get(obj)[name] = value;
};

exports.has_slot = function (obj, name) {
    return slotsMap.has(obj) && name in slotsMap.get(obj);
};

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-standard-built-in-objects
exports.define_built_in_data_property = function (object, propertyName, value) {
    Object.defineProperty(object, propertyName, {
        value: value,
        configurable: true,
        writable: true,
        enumerable: false
    });
};
