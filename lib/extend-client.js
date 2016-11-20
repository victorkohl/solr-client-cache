'use strict';

const querystring = require('querystring');

const keygen = require('./keygen');

module.exports = function (solrClient, cache) {
  const oldSearch = solrClient.search;

  solrClient.search = function (query, callback) {
    if (typeof this.cacheOptions !== 'object' ||
        !this.cacheOptions.hasOwnProperty('ttl')) {
      return oldSearch.apply(this, arguments);
    }

    const key = this.cacheOptions.customKey || this.getCacheKey(query);
    const ttl = this.cacheOptions.ttl;

    cache
      .get(key)
      .then(cachedResults => {
        if (cachedResults) {
          callback(null, cachedResults);
          return cachedResults;
        }

        return oldSearch
          .call(solrClient, query, (err, results) => {
            if (err) {
              return callback(err);
            }

            cache.set(key, results, ttl)
              .then(() => callback(null, results));
          });
      })
      .catch(callback);
  };

  solrClient.cache = function (ttl, customKey) {
    if (typeof ttl === 'string') {
      customKey = ttl;
      ttl = undefined;
    }

    return Object.assign({}, this, {
      cacheOptions: { ttl, customKey }
    });
  };

  solrClient.getCacheKey = function (query) {
    const key = {
      query: '',
      host: this.options.host,
      port: this.options.port,
      core: this.options.core,
      path: this.options.path
    };

    if (query && typeof query.build === 'function') {
      key.query += query.build();
    } else if (typeof query === 'object') {
      key.query += querystring.stringify(query);
    } else if (typeof query === 'string') {
      key.query += query;
    }

    return keygen(key);
  };
};
