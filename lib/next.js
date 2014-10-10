var _ = require('underscore');
var fuse = require('fusing');
var debug = require('debug')('synapsejs');

function Next(ctx, op, item, index) {
  this.fuse();
  var _canceled = false;

  /**
   * @ignore
   * @private
   */
  function doRemove(idx) {
    if (index === 0) {
      debug('remove first item %o', item);
    } else if (index === _.size(ctx.items) - 1) {
      debug('remove last item %o', item);
    } else {
      debug('remove item %o at position %d', item, index);
    }
    ctx.items.splice(idx, 1);
    ctx.emit('remove', ctx, item);
    ctx.emit('remove-after', ctx, item);
    if (_.size(ctx.items) === 0) {
      ctx.emit('empty', ctx);
    }
  }
  function cancel() {
    debug('cancel %o item %o', op, item);
    ctx.emit(op + '-cancel', ctx, item, resume.bind(this));
    _canceled = true;
  }
  function resume() {
    if (!_.isNumber(index)) {
      if (op === 'add') {
        debug('resume last item %o', item);
      }
    } else if (index === 0) {
      debug('resume first item %o', item);
    } else if (index === _.size(ctx.items) - 1) {
      debug('resume last item %o', item);
    }
    if (_canceled) {
      if (index > 0 && index < (_.size(ctx.items) - 1)) {
        throw new Error('unable to resume \'' + op + '\' at position ' + index);
      }
      ctx.emit(op + '-resume', ctx, item);
      _canceled = false;
      done();
    }
  }
  function done() {
    if (!_canceled) {
      if (op === 'add') {
        if (!_.isNumber(index)) {
          debug('add last item %o', item);
          ctx.items.push(item);
        } else if (index === 0) {
          debug('add first item %o', item);
          ctx.items.unshift(item);
        } else {
          debug('add item %o at position %d', item, index);
          ctx.items.splice(index, 0, item);
        }
        ctx.emit('add', ctx, item);
        ctx.emit('add-after', ctx, item);
      } else if (op === 'remove') {
        var idx;
        // remove any duplicate
        while (~(idx = ctx.items.indexOf(item))) {
          doRemove(idx);
        }
      }
    }
  }

  // properties
  this.readable('canceled', {
    get: function get() {
      return _canceled;
    }
  }, true);
  // methods
  this.readable('cancel', cancel);
  this.readable('resume', resume);
  this.readable('done', done);
}

fuse(Next, Object);

module.exports = Next;
