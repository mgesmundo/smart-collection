/**
 * @class smart_collection.Collection
 */

var _ = require('underscore');
_.str = require('underscore.string');
var EventEmitter = require('events').EventEmitter;
var fuse = require('fusing');
var debug = require('debug')('smart-collection');

/**
 * Add a new item(s) at a specific position.
 * @method addAt
 * @param {Object|Array} items An array of objects or a single object.
 * @param {Number} index The position.
 * @fires add-before
 * @fires add
 * @fires add-after
 * @chainable
 */
function addAt(items, index) {
  if (items) {
    if (_.isArray(items)) {
      _.each(items, function (item) {
        addAt.call(this, item, index);
        if (_.isNumber(index)) {
          index++;
        }
      }, this);
    } else {
      this.emit('add-before', items);
      if (!this.cancel) {
        if (!_.isNumber(index)) {
          debug('add last item %o', items);
          this.items.push(items);
        } else if (index === 0) {
          debug('add first item %o', items);
          this.items.unshift(items);
        } else {
          debug('add item %o at position %d', items, index);
          this.items.splice(index, 0, items);
        }
        this.emit('add', items);
        this.emit('add-after', items);
      } else {
        this.emit('add-cancel', items);
      }
      this.cancel = false;
    }
  }
  return this;
}
/**
 * Add a new item(s) at top of the collection.
 * @method addFirst
 * @param {Object|Array} items An array of objects or a single object.
 * @fires add-before
 * @fires add
 * @fires add-after
 * @chainable
 */
function addFirst(items) {
  return addAt.call(this, items, 0);
}
/**
 * Add a new item(s) at bottom of the collection.
 *
 * ## Example
 *
 * ```js
 * var Collection = require('smart-collection');
 * var coll = new Collection();
 *
 * coll.on('cancel', function (item) {
 *   console.log(item);       // {name: 'item1'}
 * });
 * coll.on('add-before', function (item) {
 *   console.log('event');
 *   if (item.name === 'item1') {
 *     // break the add operation
 *     this.cancel = true;
 *   }
 * });
 *
 * coll.add([{name: 'item1'}, {name: 'item2'}]);
 * coll.remove([{name: 'item1'}, {name: 'item2'}]);
 *
 * console.log(coll.items);   // {name: 'item2'}
 * ```
 *
 * @method add
 * @param {Object|Array} items An array of objects or a single object.
 * @fires add-before
 * @fires add
 * @fires add-after
 * @chainable
 */
function add(items) {
  return addAt.call(this, items);
}
/**
 * Remove an item from the collection at a specific position.
 * @method removeAt
 * @param {Number} index The position.
 * @fires remove-before
 * @fires remove
 * @fires remove-after
 * @chainable
 */
function removeAt(index) {
  if (_.isNumber(index)) {
    if (~index) {
      var item = this.items[index];
      this.emit('remove-before', item);
      if (!this.cancel) {
        debug('remove item %o at position %d', item, index);
        this.items.splice(index, 1);
        this.emit('remove', item);
        this.emit('remove-after', item);
        if (_.size(this.items) === 0) {
          this.emit('empty');
        }
      } else {
        this.emit('remove-cancel', item);
      }
    }
  }
  return this;
}
/**
 * Remove an item(s) from the collection.
 *
 * ## Example
 *
 * ```js
 * var Collection = require('smart-collection');
 * var coll = new Collection();
 *
 * coll.on('cancel', function (item) {
 *   console.log(item);       // {name: 'item1'}
 * });
 * coll.on('add-before', function (item) {
 *   console.log('event');
 *   if (item.name === 'item1') {
 *     // break the remove operation
 *     this.cancel = true;
 *   }
 * });
 *
 * coll.add([{name: 'item1'}, {name: 'item2'}]);
 * coll.remove([{name: 'item1'}, {name: 'item2'}]);
 *
 * console.log(coll.items);   // {name: 'item1'}
 * ```
 * @method remove
 * @param {Object|Array} items An array of objects or a single object.
 * @fires remove-before
 * @fires remove
 * @fires remove-after
 * @chainable
 */
function remove(items) {
  if (items) {
    if (_.isArray(items)) {
      _.each(items, function (item) {
        remove.call(this, item);
      }, this);
    } else {
      var found = _.findWhere(this.items, items);
      if (found) {
        removeAt.call(this, _.indexOf(this.items, found));
        // remove any duplicates
        if (!this.cancel) {
          remove.call(this, items);
        }
        this.cancel = false;
      }
    }
  }
  return this;
}
/**
 * Remove first item from the collection.
 * @method removeFirst
 * @fires remove-before
 * @fires remove
 * @fires remove-after
 * @chainable
 */
function removeFirst() {
  return removeAt.call(this, 0);
}
/**
 * Remove last item from the collection.
 * @method removeLast
 * @fires remove-before
 * @fires remove
 * @fires remove-after
 * @chainable
 */
function removeLast() {
  return removeAt.call(this, this.items.length - 1);
}
/**
 * Remove a specified number of items from the collection starting from a specific position.
 * @method removeRange
 * @param {Number} start The start position.
 * @param {Number} length The number of the items to remove.
 * @fires remove-before
 * @fires remove
 * @fires remove-after
 * @chainable
 */
function removeRange(start, length) {
  if (length > 0) {
    var i;
    for (i = 0; i < length; i++) {
      removeAt.call(this, start);
    }
  }
  return this;
}
/**
 * Remove all items from the collection.
 * @method flush
 * @fires flush
 * @chainable
 */
function flush(){
  debug('flush');
  while (this.items.length > 0) {
    this.removeLast();
  }
  this.emit('flush');
  return this;
}
/**
 * Add a view of the items in collection. The view are available as method of the collection.
 *
 * ## Example
 *
 *      // dependencies
 *      var Collection = require('smart-collection');
 *      // create new collection
 *      var c = new Collection('myCollection');
 *      // add three items
 *      c.add([
 *        { name: 'Sam' },
 *        { name: 'John' },
 *        { name: 'Path' }
 *      ]);
 *      // create a custom view
 *      c.addView('myView', function (){
 *        // the first two items
 *        return Array.prototype.slice.call(c.items, 0, 2);
 *      });
 *      console.log('myView', c.myView);    // [ { name: 'Sam' }, { name: 'John' } ]
 *
 * @param {String} name The name of the view.
 * @param {Function} fn The function used to compute the items into the view.
 * @chainable
 */
function addView(name, fn) {
  debug('add view "%s"', name);
//  debug('add view %o with function %o', (name ? name : '-'),
//    (fn ? _.str.prune(fn.toString()
//      .replace(/\s{2,}/g,' ')
//      .replace(/\r?\n|\r/g, ''), 50) : '-'));
  if (!_.isString(name)) {
    throw new Error('name required');
  }
  if (!_.isFunction(fn)) {
    throw new Error('function required');
  }
  this.readable(name, {
    get: function () {
      return fn.call(this);
    }
  }, true);
  return this;
}
/**
 * Add one or more [underscore](1) functions (for collections and arrays) and make a correspondent method into the collection.
 *
 * ## Example
 *
 *      // dependencies
 *      var Collection = require('smart-collection');
 *      // create new collection
 *      var c = new Collection('myCollection');
 *      // add an item
 *      c.add({ name: 'John' });
 *      // add two other items
 *      c.add([
 *        { name: 'Sam' },
 *        { name: 'Pat' }
 *      ]);
 *      // show all items
 *      console.log(c.all);  // [ { name: 'John' }, { name: 'Sam' }, { name: 'Pat' } ]
 *      // add a feature
 *      c.addFeature('filter');
 *      // add a view using a feature
 *      c.addView('myView', function () {
 *        // 'filter' is available as method
 *        return c.filter(function (item) {
 *          return item.name.length === 3;
 *        });
 *      });
 *      console.log(c.myView);  // [ { name: 'Sam' }, { name: 'Pat' } ]
 *
 * @param {String|Array} features The name or the array of the names of the required functions to add as methods.
 *
 * __NOTE__: the name of the feature (function) must be the same of the correspondent function in [underscore](1). The signature of the added method is the same of the correspondent function without the first parameter that is fixed to the entire collection of items.
 * @chainable
 *
 * [1]: http://underscorejs.org
 *
 */
function addFeature(features) {
  var addOne = function (feature) {
    debug('add feature %s', feature);
    if (!_.has(_, feature)) {
      throw new Error('feature "' + feature + '" not found');
    }
    function wrap() {
      var args = _.toArray(arguments);
      args.unshift(this.items);
      return _[feature].apply(this, args);
    }
    this.readable(feature, {
      get: function () {
        return wrap;
      }
    }, true);
  }.bind(this);
  if (features) {
    if (_.isArray(features)) {
      _.each(features, function (feature) {
        addOne(feature);
      });
    } else {
      addOne(features);
    }
  }
  return this;
}
/**
 * Add all [underscore](1) functions (for collections and arrays) and make all correspondent methods into the collection.
 * @chainable
 */
function addAllFeatures() {
  var METHODS = require('./methods');
  _.each(METHODS, function (method) {
    addFeature.call(this, method);
  }, this);
  return this;
}
/**
 * @class smart_collection.Collection
 * @cfg {String} [name] The optional name of the collection
 * @constructor
 */
function Collection(name) {
  this.fuse();
  if (_.isObject(name)) {
    name = name.name;
  }

  // properties
  this.readable('name', name);
  /**
   * @property {Array} items The entire collection of items.
   */
  this.readable('items', []);

  // add default view
  /**
   * @property {Array} all The default view with all items.
   */
  addView.call(this, 'all', function () {
    return this.items;
  });

  debug('ready');
}

fuse(Collection, EventEmitter);

var def = Collection.predefine;
var readable = def(Collection.prototype);

readable('add', add);
readable('addFirst', addFirst);
readable('addAt', addAt);
readable('remove', remove);
readable('removeFirst', removeFirst);
readable('removeLast', removeLast);
readable('removeAt', removeAt);
readable('removeRange', removeRange);
readable('flush', flush);
readable('addView', addView);
readable('addFeature', addFeature);
readable('addAllFeatures', addAllFeatures);

module.exports = Collection;

/**
 * @event add-before Fired before the add event.
 * @param {Object} item The new item.
 */
/**
 * @event add Fired when a new item is added to the collection.
 * @param {Object} item The new item.
 */
/**
 * @event add-after Fired after the add event.
 * @param {Object} item The new item.
 */
/**
 * @event add-cancel Fired when an add event is canceled.
 * To do this use `this.cancel = true` in `add-before` handler.
 * @param {Object} item The new item.
 */
/**
 * @event remove-before Fired before the remove event.
 * @param {Object} item The new item.
 */
/**
 * @event remove Fired when an item is removed from the collection.
 * @param {Object} item The removed item.
 */
/**
 * @event remove-after Fired after the remove event.
 * @param {Object} item The new item.
 */
/**
 * @event remove-cancel Fired when a remove event is canceled.
 * To do this use `this.cancel = true` in `remove-before` handler.
 * @param {Object} item The new item.
 */
/**
 * @event empty Fired when the collection became empty.
 */
/**
 * @event flush Fired when the collection is flushed and after the empty event.
 */
