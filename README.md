# ECMAScript Spec Operations, in ECMAScript

Have you ever wanted to write a to-the-letter implementation of some ECMAScript spec function? Maybe you want to run tests against it; maybe you're just crazy and like self-hosting JavaScript in JavaScript. In either case, this is the package for you!

**Especially** has a small-but-growing collection of meta-textual and abstract operations drawn directly from the pages of the [ECMAScript 2015 draft specification](https://tc39.github.io/ecma262/). From common things like [Get](https://tc39.github.io/ecma262/#sec-get-o-p) to dealing with [internal slots](https://tc39.github.io/ecma262/#sec-object-internal-methods-and-internal-slots), Especially has you covered.

## APIs

Especially has no main module (*gasp*). Instead, you'll require one of the top-level modules that contain the stuff you want.

### require("especially/abstract-operations")

- [ArrayCreate](https://tc39.github.io/ecma262/#sec-arraycreate)
- [Call](https://tc39.github.io/ecma262/#sec-call)
- [CreateDataProperty](https://tc39.github.io/ecma262/#sec-createdataproperty)
- [DateFromTime](https://tc39.github.io/ecma262/#sec-date-number)
- [Day](https://tc39.github.io/ecma262/#sec-day-number-and-time-within-day)
- [DayFromYear](https://tc39.github.io/ecma262/#sec-year-number)
- [DaysInYear](https://tc39.github.io/ecma262/#sec-year-number)
- [DayWithinYear](https://tc39.github.io/ecma262/#sec-month-number)
- [EnqueueJob](https://tc39.github.io/ecma262/#sec-enqueuejob)
- [Get](https://tc39.github.io/ecma262/#sec-get-o-p)
- [GetV](https://tc39.github.io/ecma262/#sec-getv)
- [GetIterator](https://tc39.github.io/ecma262/#sec-getiterator): uses the `@@iterator` symbol.
- [GetMethod](https://tc39.github.io/ecma262/#sec-getmethod)
- [GetPrototypeFromConstructor](https://tc39.github.io/ecma262/#sec-getprototypefromconstructor)
- [HasProperty](https://tc39.github.io/ecma262/#sec-hasproperty)
- [InLeapYear](https://tc39.github.io/ecma262/#sec-year-number)
- [Invoke](https://tc39.github.io/ecma262/#sec-invoke)
- [IsCallable](https://tc39.github.io/ecma262/#sec-iscallable)
- [IsConstructor](https://tc39.github.io/ecma262/#sec-isconstructor): not spec compliant, but the best we can do
- [IsPropertyKey](https://tc39.github.io/ecma262/#sec-ispropertykey)
- [IteratorComplete](https://tc39.github.io/ecma262/#sec-iteratorcomplete)
- [IteratorNext](https://tc39.github.io/ecma262/#sec-iteratornext)
- [IteratorStep](https://tc39.github.io/ecma262/#sec-iteratorstep)
- [IteratorValue](https://tc39.github.io/ecma262/#sec-iteratorvalue)
- [MakeDate](https://tc39.github.io/ecma262/#sec-makedate)
- [MakeDay](https://tc39.github.io/ecma262/#sec-makeday)
- [MakeTime](https://tc39.github.io/ecma262/#sec-maketime)
- [MonthFromTime](https://tc39.github.io/ecma262/#sec-month-number)
- [ObjectCreate](https://tc39.github.io/ecma262/#sec-objectcreate)
- [OrdinaryCreateFromConstructor](https://tc39.github.io/ecma262/#sec-ordinarycreatefromconstructor)
- [SameValue](https://tc39.github.io/ecma262/#sec-samevalue)
- [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero)
- [SpeciesConstructor](https://tc39.github.io/ecma262/#sec-speciesconstructor)
- [TimeClip](https://tc39.github.io/ecma262/#sec-timeclip)
- [TimeFromYear](https://tc39.github.io/ecma262/#sec-year-number)
- [TimeWithinDay](https://tc39.github.io/ecma262/#sec-day-number-and-time-within-day)
- [ToBoolean](https://tc39.github.io/ecma262/#sec-toboolean)
- [ToInteger](https://tc39.github.io/ecma262/#sec-tointeger)
- [ToLength](https://tc39.github.io/ecma262/#sec-tolength)
- [ToNumber](https://tc39.github.io/ecma262/#sec-tonumber)
- [ToObject](https://tc39.github.io/ecma262/#sec-toobject)
- [ToString](https://tc39.github.io/ecma262/#sec-tostring)
- [Type](https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values): returns the types as strings, e.g. `"Object"`.
- [YearFromTime](https://tc39.github.io/ecma262/#sec-year-number)

### require("especially/math")

A variety of math operations from the [Algorithm Conventions](https://tc39.github.io/ecma262/#sec-algorithm-conventions) section of the spec:

- abs(_x_)
- sign(_x_)
- min(<var>x</var><sub>1</sub>, <var>x</var><sub>2</sub>, …, <var>x</var><sub>n</sub>)
- floor(_x_)

### require("especially/meta")

- [`assert`](https://tc39.github.io/ecma262/#sec-algorithm-conventions): ensures you pass it a boolean, then throws if it's not true
- [`define_built_in_data_property`](https://tc39.github.io/ecma262/#sec-ecmascript-standard-built-in-objects): a shortcut for defining a built-in data property with the usual property descriptor.
- [Internal slot](https://tc39.github.io/ecma262/#sec-object-internal-methods-and-internal-slots) management:
    - `make_slots(object, arrayOfSlotNames)`: call this to initialize an object's internal slots. Often referenced in the spec as "instances of (something) are initially created with the internal slots listed in (some table)."
    - `get_slot(object, name)`: get the value of an internal slot. Often referenced in the spec as "the value of (object)'s [[SlotName]] internal slot."
    - `set_slot(object, name)`: set the value of an internal slot. Often referenced in the spec as "Set (object)'s [[SlotName]] internal slot to (a value)."
    - `has_slot(object)`: check whether an object has an internal slot with the given name. Often referenced in the spec as "If (object) does not have a [[SlotName]] internal slot."

### require("especially/well-known-symbols")

One [well-known symbol](https://tc39.github.io/ecma262/#sec-well-known-symbols) is included:

- `"@@iterator"` will give you a symbol that is used by GetIterator. (It is the same as V8's default `Symbol.iterator`.)
- `"@@species"` will give the symbol that is used by SpeciesConstructor. (It is a freshly-minted symbol, since V8 doesn't have `Symbol.species` yet.)

### require("especially/intrinsics")

Some of the [well-known intrinsic objects](https://tc39.github.io/ecma262/#sec-well-known-intrinsic-objects) are included by name, e.g. `"%ObjectPrototype%"`. These are used by GetPrototypeFromConstructor and related operations.

## Usage Notes

Especially is meant to run in io.js (not Node.js™). It uses certain ES2015 features only implemented in modern V8.

Install it from npm into your project with `npm install especially`.

You can see examples of it in use in [the reference implementation of the ES2015 promises specification](https://github.com/domenic/promises-unwrapping/tree/master/reference-implementation).
