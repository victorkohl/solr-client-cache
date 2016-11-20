'use strict';

const Cacheman = require('cacheman');

class Cache {
  constructor(options) {
    Object.defineProperty(this, '_cache', {
      value: new Cacheman('solr-cache', options)
    });
  }

  get(key) {
    return this._cache.get(key);
  }

  set(key, value, ttl) {
    if (ttl === 0) ttl = -1;
    return this._cache.set(key, value, ttl);
  }

  del(key) {
    return this._cache.del(key);
  }

  clear() {
    return this._cache.clear();
  }
}

module.exports = function (options) {
  return new Cache(options);
};
module.exports.Cache = Cache;
