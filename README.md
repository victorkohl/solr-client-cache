# solr-client-cache

##### Caching module for [solr-client][1] using [cacheman][2].


## Installation

This module is distributed using npm which comes bundled with node:

```
npm install --save solr-client-cache
```


## Usage

```javascript
const solr = require('solr-client');
const solrCache = require('solr-client-cache');

const client = solr.createClient();

solrCache(client, {
  ttl: 60,
  engine: 'redis',
  host: '127.0.0.1',
  port: 6379
});

// search Solr with cache
client
  .cache()
  .search(query, (err, results) => { /* ... */ });

// search Solr without cache
client
  .search(query, (err, results) => { /* ... */ });
```

If you want a different TTL (Time to Live) for a specific query, then pass it to the `cache()` function.

```javascript
const solr = require('solr-client');
const solrCache = require('solr-client-cache');

const client = solr.createClient();

solrCache(client, { ttl: 60 });

// search Solr with cache
client
  .cache(10) // 10 seconds TTL instead of 60s
  .search(query, (err, results) => { /* ... */ });
```

All cache options (TTL, engine, etc...) are described on [cacheman README][3].


## Test

Just run:

```
npm test
```

## License

MIT

[1]: https://github.com/lbdremy/solr-node-client
[2]: https://github.com/cayasso/cacheman
[3]: https://github.com/cayasso/cacheman#cachemanname-options