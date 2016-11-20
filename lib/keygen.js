'use strict';

const jsosort = require('jsosort');
const sha1 = require('sha1');

module.exports = function init(obj) {
  obj = jsosort(obj);
  obj = JSON.stringify(obj);

  return sha1(obj);
};
