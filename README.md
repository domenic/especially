# ECMAScript Spec Operations, in ECMAScript

Have you ever wanted to write a to-the-letter implementation of some ECMAScript spec function? Maybe you want to run tests against it; maybe you're just crazy and like self-hosting JavaScript in JavaScript. In either case, this is the package for you!

**Especially** has a small-but-growing collection of meta-textual and abstract operations drawn directly from the pages of the [ECMAScript 6 draft specification](http://people.mozilla.org/~jorendorff/es6-draft.html). From common things like [Get](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-o-p) to dealing with [internal slots](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object-internal-methods-and-internal-slots), Especially has you covered.

## APIs

Especially has no main module (*gasp*). Instead, you'll require one of the top-level modules that contain the stuff you want.

### require("especially/abstract-operations")

- [IsCallable](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable)
- [IsConstructor](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor): not spec compliant, but the best we can do
- [Type](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-data-types-and-values): returns the types as strings, e.g. `"Object"`.
- [IsPropertyKey](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey)
- [Get](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-get-o-p)
- [SameValue](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue)
- [ArrayCreate](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-arraycreate)

### require("especially/meta")

- [`assert`](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-algorithm-conventions): ensures you pass it a boolean, then throws if it's not true
- [`define_built_in_data_property`](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-standard-built-in-objects): a shortcut for defining a built-in data property with the usual property descriptor.
- [Internal slot](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object-internal-methods-and-internal-slots) management:
    - `make_slots(object, arrayOfSlotNames)`: call this to initialize an object's internal slots. Often referenced in the spec as "instances of (something) are initially created with the internal slots listed in (some table)."
    - `get_slot(object, name)`: get the value of an internal slot. Often referenced in the spec as "the value of (object)'s [[SlotName]] internal slot."
    - `set_slot(object, name)`: set the value of an internal slot. Often referenced in the spec as "Set (object)'s [[SlotName]] internal slot to (a value)."
    - `has_slot(object)`: check whether an object has an internal slot with the given name. Often referenced in the spec as "If (object) does not have a [[SlotName]] internal slot."

## Usage Notes

Especially is meant to run in Node.js 0.11.9+, at least for now. It uses certain ES6 features so far only implemented in bleeding-edge V8, with the `--harmony` flag turned on.

Install it from npm into your project with `npm install especially`. And don't forget to run your program, or your tests, with the `--harmony` flag.

You can see examples of it in use in [the reference implementation of the ES6 promises specification](https://github.com/domenic/promises-unwrapping/tree/master/reference-implementation).
