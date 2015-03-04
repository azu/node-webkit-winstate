/* jshint node:true, unused:strict */
/* global describe:true, it:true, beforeEach:true */

"use strict";

var proxyquire = require('proxyquire');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');

var START_X = 1;
var START_Y = 2;
var START_WIDTH = 3;
var START_HEIGHT = 4;

var WinStub = function() {
  this.window = { addEventListener: function() {} };
};
util.inherits(WinStub, EventEmitter);
WinStub.prototype.show = function() {};
WinStub.prototype.resizeTo = function() {};
WinStub.prototype.moveTo = function() {};
WinStub.prototype.close = function() {};

GLOBAL.localStorage = {
  windowState: JSON.stringify({
    x: START_X,
    y: START_Y,
    width: START_WIDTH,
    height: START_HEIGHT
  })
};

var win = new WinStub();

proxyquire('..', {
  'nw.gui': {
    // stop proxyquire trying to load nw.gui
    '@noCallThru': true,
    Window: {
      get: function() { return win; }
    },
    App: { manifest: {} }
  }
});


describe('node-webkit-winstate', function() {

  beforeEach(function() {
    win.resizeTo = function() {};
    win.moveTo = function() {};
    win.x = START_X;
    win.y = START_Y;
    win.width = START_WIDTH;
    win.height = START_HEIGHT;
  });

  it('restores window size on unmaximize', function(done) {
    win.resizeTo = function(width, height) {
      assert.equal(width, START_WIDTH);
      assert.equal(height, START_HEIGHT);

      done();
    };

    win.emit('unmaximize');
  });

  it('restores window position on unmaximize', function(done) {
    win.moveTo = function(x, y) {
      assert.equal(x, START_X);
      assert.equal(y, START_Y);

      done();
    };

    win.emit('unmaximize');
  });

  it('saves window state on close', function() {
    var x = 5;
    var y = 6;
    var width = 7;
    var height = 8;

    win.x = x;
    win.y = y;
    win.width = width;
    win.height = height;

    win.emit('close');

    var windowState = JSON.parse(GLOBAL.localStorage['windowState']);

    assert(windowState.x, x);
    assert(windowState.y, y);
    assert(windowState.width, width);
    assert(windowState.height, height);
  });
});
