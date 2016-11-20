'use strict';

module.exports = function SolrClientCache(solrClient, cacheOptions) {
  const cache = solrClient.__cache = require('./cache')(cacheOptions);

  require('./extend-client')(solrClient, cache);
};
