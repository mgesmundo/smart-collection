var Collection = require('..');
var sinon = require('sinon');
var should = require('should');
var _ = require('underscore');
var METHODS = require('../lib/methods');

var item1 = {
  name: 'item1',
  a: 'a',
  b: 'b'
};
var item2 = {
  name: 'item2',
  c: 'c',
  d: 'd'
};
var item3 = {
  name: 'item3',
  a: 'e',
  b: 'f'
};
var item4 = {
  name: 'item4',
  a: 'a',
  b: 'f'
};

describe('Collection', function() {
  describe('using default tools', function() {
    it('should create a collection whit a name passed as string', function(done) {
      var coll = new Collection('collection');
      coll.name.should.eql('collection');
      done();
    });
    it('should create a collection whit a name passed as object config', function(done) {
      var coll = new Collection({
        name: 'collection'
      });
      coll.name.should.eql('collection');
      done();
    });
    it('should add an item', function(done) {
      var coll = new Collection('collection');
      coll.on('add', function (sender, item) {
        sender.should.equal(coll);
        item.should.eql(item1);
        done();
      });
      coll.name.should.equal('collection');
      coll.items.should.is.instanceOf(Array);
      coll.add(item1);
      _.find(coll.items, item1).should.eql(item1);
    });
    it('should add three items', function(done) {
      var coll = new Collection();
      var onAdd = sinon.spy();
      coll.on('add', onAdd);
      coll.add([item1, item2, item3]);
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      onAdd.calledThrice.should.true;
      done();
    });
    it('should add an item as first', function(done) {
      var coll = new Collection('collection');
      coll.add([item2, item3]);
      coll.addFirst(item1);
      coll.items[0].should.eql(item1);
      done();
    });
    it('should add an item at index', function(done) {
      var coll = new Collection('collection');
      coll.add([item1, item2, item4]);
      coll.addAt(item3, 2);
      coll.items.should.instanceOf(Array).and.have.lengthOf(4);
      coll.items[2].should.eql(item3);
      done();
    });
    it('should add two item at index', function(done) {
      var coll = new Collection('collection');
      coll.add([item1, item4]);
      coll.addAt([item2, item3], 1);
      coll.items.should.instanceOf(Array).and.have.lengthOf(4);
      coll.items[1].should.eql(item2);
      coll.items[2].should.eql(item3);
      done();
    });
    it('should execute a function before and after add an item', function(done) {
      var coll = new Collection();
      var onAddBefore = sinon.spy();
      var onAddAfter = sinon.spy();
      coll.on('add-before', onAddBefore);
      coll.on('add-after', onAddAfter);
      coll.add(item1);
      onAddBefore.calledOnce.should.true;
      onAddAfter.calledOnce.should.true;
      done();
    });
    it('should remove an item', function(done) {
      var coll = new Collection();
      var onAddBefore = sinon.spy();
      var onAddAfter = sinon.spy();
      var onRemoveBefore = sinon.spy();
      var onRemove = sinon.spy();
      var onRemoveAfter = sinon.spy();
      coll.on('add-before', onAddBefore);
      coll.on('add-after', onAddAfter);
      coll.on('remove-before', onRemoveBefore);
      coll.on('remove', onRemove);
      coll.on('remove-after', onRemoveAfter);
      coll
        .add(item1)
        .add(item2)
        .add(item3);
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      coll.remove(item2);
      coll.items.should.instanceOf(Array).and.have.lengthOf(2);
      onAddBefore.calledThrice.should.true;
      onAddAfter.calledThrice.should.true;
      onRemoveBefore.calledOnce.should.true;
      onRemoveAfter.calledOnce.should.true;
      done();
    });
    it('manipulate an item before and after its removed', function(done) {
      var coll = new Collection();
      var id = Math.round(Math.random() * 1000);
      coll.on('remove-before', function (item) {
        item.id = id;
      });
      coll.on('remove', function (item) {
        item.id++;
      });
      coll.on('remove-after', function (item) {
        item.id.should.equal(id + 1);
      });
      var onEmpty = sinon.spy();
      coll.on('remove', onEmpty);
      coll.add(item1);
      coll.items.should.instanceOf(Array).and.have.lengthOf(1);
      coll.remove(item1);
      coll.items.should.instanceOf(Array).and.have.lengthOf(0);
      onEmpty.calledOnce.should.true;
      done();
    });
    it('should remove two items', function(done) {
      var coll = new Collection();
      var onAddBefore = sinon.spy();
      var onAddAfter = sinon.spy();
      var onRemoveBefore = sinon.spy();
      var onRemoveAfter = sinon.spy();
      coll.on('add-before', onAddBefore);
      coll.on('add-after', onAddAfter);
      coll.on('remove-before', onRemoveBefore);
      coll.on('remove-after', onRemoveAfter);
      coll.add([item1, item2, item3]);
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      coll.remove([item1, item2]);
      coll.items.should.instanceOf(Array).and.have.lengthOf(1);
      onAddBefore.calledThrice.should.true;
      onAddAfter.calledThrice.should.true;
      onRemoveBefore.calledTwice.should.true;
      onRemoveAfter.calledTwice.should.true;
      done();
    });
    it('should flush all items', function(done) {
      var coll = new Collection();
      coll.add([item1, item2, item3]);
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      var onEmpty = sinon.spy();
      var onRemove = sinon.spy();
      coll.on('remove', onRemove);
      coll.on('empty', onEmpty);
      coll.on('flush', function () {
        onEmpty.calledOnce.should.true;
        onRemove.calledThrice.should.true;
        coll.items.should.instanceOf(Array).and.have.lengthOf(0);
        done();
      });
      coll.flush();
    });
    it('should remove item at position', function(done) {
      var coll = new Collection();
      coll.add([item1, item2, item3, item4]);
      coll.removeAt(1);
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      coll.items.should.eql([item1, item3, item4]);
      done();
    });
    it('should remove first item', function(done) {
      var coll = new Collection();
      coll.add([item1, item2, item3, item4]);
      coll.removeFirst();
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      coll.items.should.eql([item2, item3, item4]);
      done();
    });
    it('should remove last item', function(done) {
      var coll = new Collection();
      coll.add([item1, item2, item3, item4]);
      coll.removeLast();
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      coll.items.should.eql([item1, item2, item3]);
      done();
    });
    it('should remove items between range', function(done) {
      var coll = new Collection();
      coll.add(['item1', 'item2', 'item3', 'item4']);
      coll.removeRange(1, 2);
      coll.items.should.instanceOf(Array).and.have.lengthOf(2);
      coll.items.should.eql(['item1', 'item4']);
      done();
    });
    it('should read default view', function(done) {
      var coll = new Collection();
      coll.add([item1, item2, item3]);
      coll.all.should.is.instanceOf(Array).and.have.lengthOf(3);
      done();
    });
    it('should add a custom view', function(done) {
      var coll = new Collection();
      coll.add([item1, item2, item3]);
      coll.addView('myview', function () {
        return coll.items;
      });
      coll.myview.should.eql(coll.items);
      coll.addView('myotherview', function () {
        return _.first(coll.items, 2);
      });
      coll.myotherview.should.eql([coll.items[0], coll.items[1]]);
      coll.flush();
      coll.myview.should.be.empty;
      coll.myotherview.should.be.empty;
      done();
    });
    it('should throws an error if a view is declared without a name', function(done) {
      var coll = new Collection();
      (function () {
        coll.addView();
      }).should.throw('name required');
      done();
    });
    it('should throws an error if a view is declared without a function', function(done) {
      var coll = new Collection();
      (function () {
        coll.addView('myview');
      }).should.throw('function required');
      done();
    });
    it('should cancel add event', function(done) {
      var coll = new Collection();
      var onCancel = sinon.spy();
      coll.on('add-cancel', onCancel);
      coll.on('add-before', function (sender, item, next) {
        if (item.name === 'item1') {
          next.cancel();
        }
      });
      coll.add([item1, item3]);
      coll.items.should.instanceOf(Array).and.have.lengthOf(1);
      onCancel.calledOnce.should.true;
      done();
    });
    it('should cancel remove event', function(done) {
      var coll = new Collection();
      var onCancel = sinon.spy();
      coll.on('remove-cancel', onCancel);
      coll.on('remove-before', function (sender, item, next) {
        if (item.name === 'item1') {
          next.cancel();
        }
      });
      coll.add([item1, item3, item3, item3]);
      coll.remove([item1, item3]);
      coll.items.should.instanceOf(Array).and.have.lengthOf(1);
      onCancel.calledOnce.should.true;
      done();
    });
    it('should cancel and resume add one item', function(done) {
      var coll = new Collection();
      var restoreItem;
      var onCancel = sinon.spy(function (sender, item, restore){
        item.should.equal(item1);
        restore.should.type('function');
        restoreItem = restore;
      });
      var onResume = sinon.spy(function (sender, item) {
        item.should.equal(item1);
      });
      coll.on('add-resume', onResume);
      coll.on('add-cancel', onCancel);
      coll.on('add-before', function (sender, item, next) {
        if (item.name === 'item1') {
          next.cancel();
        } else {
          restoreItem();
        }
      });
      coll.add(item1);
      coll.add(item2);
      coll.items.should.instanceOf(Array).and.have.lengthOf(2);
      onCancel.calledOnce.should.true;
      onResume.calledOnce.should.true;
      done();
    });
    it('should cancel and resume remove last item', function(done) {
      var coll = new Collection();
      var onCancel = sinon.spy(function (sender, item, restore){
        item.should.equal(item2);
        restore.should.type('function');
      });
      var onResume = sinon.spy(function (sender, item) {
        item.should.equal(item2);
      });
      var onRemove = sinon.spy();
      var onRemoveAfter = sinon.spy();
      coll.on('remove-resume', onResume);
      coll.on('remove-cancel', onCancel);
      coll.on('remove', onRemove);
      coll.on('remove-after', onRemoveAfter);
      coll.on('remove-before', function (sender, item, next) {
        if (item.name === 'item2') {
          next.cancel();
          process.nextTick(function () {
            next.canceled.should.true;
            next.resume();
            onCancel.calledOnce.should.true;
            onResume.calledOnce.should.true;
            onRemove.calledOnce.should.true;
            onRemoveAfter.calledOnce.should.true;
            done();
          });
        }
      });
      coll.add(item1);
      coll.add(item2);
      coll.items.should.instanceOf(Array).and.have.lengthOf(2);
      coll.removeLast();
    });
    it('should cancel and resume remove first item', function(done) {
      var coll = new Collection();
      var onCancel = sinon.spy(function (sender, item, restore){
        item.should.equal(item1);
        restore.should.type('function');
      });
      var onResume = sinon.spy(function (sender, item) {
        item.should.equal(item1);
      });
      var onRemove = sinon.spy();
      var onRemoveAfter = sinon.spy();
      coll.on('remove-resume', onResume);
      coll.on('remove-cancel', onCancel);
      coll.on('remove', onRemove);
      coll.on('remove-after', onRemoveAfter);
      coll.on('remove-before', function (sender, item, next) {
        if (item.name === 'item1') {
          next.cancel();
          process.nextTick(function () {
            next.canceled.should.true;
            next.resume();
            onCancel.calledOnce.should.true;
            onResume.calledOnce.should.true;
            onRemove.calledOnce.should.true;
            onRemoveAfter.calledOnce.should.true;
            done();
          });
        }
      });
      coll.add(item1);
      coll.add(item2);
      coll.items.should.instanceOf(Array).and.have.lengthOf(2);
      coll.removeFirst();
    });
    it('should cancel and not resume remove item at specific position', function(done) {
      var coll = new Collection();
      var onCancel = sinon.spy(function (sender, item, restore){
        item.should.equal(item2);
        restore.should.type('function');
      });
      var onResume = sinon.spy();
      var onRemove = sinon.spy();
      var onRemoveAfter = sinon.spy();
      coll.on('remove-resume', onResume);
      coll.on('remove-cancel', onCancel);
      coll.on('remove', onRemove);
      coll.on('remove-after', onRemoveAfter);
      coll.on('remove-before', function (sender, item, next) {
        next.cancel();
        process.nextTick(function () {
          next.canceled.should.true;
          (function () {
            next.resume();
          }).should.throw('unable to resume \'remove\' at position 1');
          coll.items.should.instanceOf(Array).and.have.lengthOf(3);
          onCancel.calledOnce.should.true;
          onResume.called.should.false;
          onRemove.called.should.false;
          onRemoveAfter.called.should.false;
          done();
        });
      });
      coll.add(item1);
      coll.add(item2);
      coll.add(item3);
      coll.items.should.instanceOf(Array).and.have.lengthOf(3);
      coll.removeAt(1);
    });
  });
  describe('using underscore tools', function() {
    it('should add "filter" feature', function(done) {
      var coll = new Collection('collection');
      coll.add(['one', 'two', 'three']);
      coll.addFeature('filter');
      coll.should.have.property('filter');
      coll.filter.should.is.function;
      coll.filter(function (item) {
        return item.length === 3;
      }).should.is.instanceOf(Array).and.have.lengthOf(2);
      done();
    });
    it('should add "filter" and "find" features', function(done) {
      var coll = new Collection('collection');
      coll.add(['one', 'two', 'three']);
      coll.addFeature(['filter', 'find']);
      coll.should.have.property('filter');
      coll.should.have.property('find');
      coll.filter.should.is.function;
      coll.find.should.is.function;
      coll.filter(function (item) {
        return item.length === 3;
      }).should.is.instanceOf(Array).and.have.lengthOf(2);
      coll.find(function (item) {
        return item.length === 3;
      }).should.equal('one');
      done();
    });
    it('should throws an error if the request feature does not exists', function(done) {
      var coll = new Collection('collection');
      (function() {
        coll.addFeature('unknown');
      }).should.throw('feature "unknown" not found');
      done();
    });
    it('should add all underscore functions for collections and arrays', function(done) {
      var coll = new Collection('collection');
      coll.addAllFeatures();
      _.each(METHODS, function (method) {
        coll.should.have.property(method);
      });
      done();
    });
  });
});
