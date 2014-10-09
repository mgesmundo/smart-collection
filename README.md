# Smart Collection

Easy manipulation of generic collections of objects with events and predefined common useful methods.

## Features

* Create a collection identified by a name
* Emit an event on `add`, `remove`, `empty` and `flush` elements (every event has the `sender` collection)
* Emit also an event `before` and `after` for every addition and deletion
* Create custom views (subsets) of the items
* Add underscore tools functions as features applied to the items
* Protected properties and methods (can't override it for mistake).

## Installation

Install `smart-collection` as usual via [npm](http://npmjs.org):

```sh
$ npm install smart-collection --save
```

## Example

```js
// dependencies
var Collection = require('smart-collection');
// create new collection
var c = new Collection('mycollection');
// add some handlers
c.on('add', function add(item) {
  console.log('>>> add new item from ' + c.name, item);
});
c.on('remove', function remove(sender, item) {
  console.log('>>> removed item from ' + c.name, item);
});
c.on('empty', function empty() {
  console.log('>>> there are no more items in ' + c.name);
});
c.on('flush', function flush() {
  console.log('>>> flushed ' + c.name);
});
// add an item
c.add({ name: 'John' });
// add two other items
c.add([
  { name: 'Sam' },
  { name: 'Pat' }
]);
// show all items
console.log('all', c.all);
// create a custom view
c.addView('myView', function (){
  // the first two items
  return Array.prototype.slice.call(c.items, 0, 2);
});
console.log('myView', c.myView);
// add a feature
c.addFeature('filter');
// use a feature
console.log('direct', c.filter(function (item) {
  return item.name.length === 3;
}));
// add a view using a feature
c.addView('myOtherView', function () {
  return c.filter(function (item) {
     return item.name.length === 3;
  });
});
console.log('myOtherView', c.myOtherView);
c.removeAt(1);
console.log('myOtherView', c.myOtherView);
// remove an item
c.remove({ name: 'John' });
// flush all items
c.flush();
c.on('add-cancel', function (item) {
  console.log('cancel add for ' + item.name);
});
c.on('add-before', function add(item, pause) {
  if (item.name === 'Sam') {
    pause(true);
  } else {
    item.date = new Date();
  }
});
c.add({ name: 'John' });
c.add({ name: 'Sam' });
console.log(c.all);
```

## API Reference

For a full documentation see the `doc` folder content.

## Tests

As usual our tests are written in the BDD styles for the [Mocha](http://visionmedia.github.com/mocha) test runner using the `should` assertion interface and the great test spies tool [Sinon](http://sinonjs.org) and also the best coverage tool [Blanket](http://blanketjs.org).
To run the test simply type in your terminal:

```bash
$ npm test
```

To run the coverage test type instead:

```bash
$ npm run cov
```

## Breaking changes

Since the 2.0 version the signature of the events is changed. Please see documentation.

## License

Copyright (c) 2014 Yoovant by Marcello Gesmundo. All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
     copyright notice, this list of conditions and the following
     disclaimer in the documentation and/or other materials provided
     with the distribution.
   * Neither the name of Yoovant nor the names of its
     contributors may be used to endorse or promote products derived
     from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
