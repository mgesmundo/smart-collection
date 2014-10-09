// dependencies
var Collection = require('..');
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
