"use strict";

// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-well-known-intrinsic-objects

exports["%Object%"] = Object;
exports["%ObjectPrototype%"] = Object.prototype;
exports["%ObjProto_toString%"] = Object.prototype.toString;
exports["%Function%"] = Function;
exports["%FunctionPrototype%"] = Function.prototype;
exports["%Array%"] = Array;
exports["%ArrayPrototype%"] = Array.prototype;
exports["%String"] = String;
exports["%StringPrototype%"] = String.prototype;
exports["%Boolean%"] = Boolean;
exports["%BooleanPrototype%"] = Boolean.prototype;

// I got tired of typing... someone else add the rest.
