'use strict';

const should = require('should');
const sinon = require('sinon');
const solr = require('solr-client');
const solrCache = require('../');
const Cache = require('../lib/cache').Cache;

const customKey = 'test';
const defaultResults = { test: 1 };
const solrClient = solr.createClient();

describe('SolrClientCache', () => {
  before((done) => {
    sinon.spy(Cache.prototype, 'get');
    sinon.spy(Cache.prototype, 'set');
    sinon.stub(solrClient, 'search').yields(null, defaultResults);

    solrCache(solrClient, {});
    done();
  });

  beforeEach(() => {
    Cache.prototype.get.reset();
    Cache.prototype.set.reset();
    return solrClient.__cache.clear();
  });

  it('should have "cache" method after initialization', (done) => {
    solrClient.cache.should.be.a.Function();
    done();
  });

  it('should have "getCacheKey" method after initialization', (done) => {
    solrClient.getCacheKey.should.be.a.Function();
    done();
  });

  describe('#cache', () => {

    it('should create a new instance', (done) => {
      solrClient.cache().should.not.equal(solrClient);
      done();
    });

    it('should set "cacheOptions"', (done) => {
      solrClient.cache().should.have.property('cacheOptions');
      done();
    });

    it('should set "cacheOptions.ttl"', (done) => {
      const sc = solrClient.cache(30);
      sc.cacheOptions.should.have.property('ttl');
      sc.cacheOptions.ttl.should.equal(30);
      done();
    });

    it('should set "cacheOptions.customKey"', (done) => {
      const sc = solrClient.cache(customKey);
      sc.cacheOptions.should.have.property('customKey');
      sc.cacheOptions.customKey.should.equal(customKey);
      done();
    });

    it('should set "cacheOptions.ttl" and "cacheOptions.customKey"', (done) => {
      const sc = solrClient.cache(40, customKey);
      sc.cacheOptions.should.have.property('ttl');
      sc.cacheOptions.should.have.property('customKey');
      sc.cacheOptions.ttl.should.equal(40);
      sc.cacheOptions.customKey.should.equal(customKey);
      done();
    });

  });

  describe('#getCacheKey', () => {

    it('should return a string', (done) => {
      solrClient.getCacheKey().should.be.a.String();
      done();
    });

    it('should return a different key for each query', (done) => {
      const key1 = solrClient.getCacheKey({ a: 1 });
      const key2 = solrClient.getCacheKey({ b: 2 });
      key1.should.not.equal(key2);
      done();
    });

    it('should return a different key for different Solr hosts', (done) => {
      const newOptions = Object.assign({}, solrClient.options, { host: 'not-the-same-host' });
      const anotherSolrClient = Object.assign({}, solrClient, { options: newOptions });
      const key1 = solrClient.getCacheKey({});
      const key2 = anotherSolrClient.getCacheKey({});
      key1.should.not.equal(key2);
      done();
    });

    it('should return a different key for different Solr ports', (done) => {
      const newOptions = Object.assign({}, solrClient.options, { port: 99991 });
      const anotherSolrClient = Object.assign({}, solrClient, { options: newOptions });
      const key1 = solrClient.getCacheKey({});
      const key2 = anotherSolrClient.getCacheKey({});
      key1.should.not.equal(key2);
      done();
    });

    it('should return a different key for different Solr cores', (done) => {
      const newOptions = Object.assign({}, solrClient.options, { core: 'not-the-same-core' });
      const anotherSolrClient = Object.assign({}, solrClient, { options: newOptions });
      const key1 = solrClient.getCacheKey({});
      const key2 = anotherSolrClient.getCacheKey({});
      key1.should.not.equal(key2);
      done();
    });

    it('should return a different key for different Solr paths', (done) => {
      const newOptions = Object.assign({}, solrClient.options, { path: 'not-the-same-path' });
      const anotherSolrClient = Object.assign({}, solrClient, { options: newOptions });
      const key1 = solrClient.getCacheKey({});
      const key2 = anotherSolrClient.getCacheKey({});
      key1.should.not.equal(key2);
      done();
    });

  });

  describe('querying with cache', () => {

    it('should cache a query when asked', (done) => {
      solrClient.cache().search({}, (err, results) => {
        should.not.exist(err);
        should(Cache.prototype.get.called).be.true();
        done();
      });
    });

    it('should save the results to cache', (done) => {
      solrClient.cache().search({}, (err, results) => {
        should.not.exist(err);
        Cache.prototype.set.calledOnce.should.be.true();
        done();
      });
    });

    it('should return the results in cache', (done) => {
      solrClient.cache().search({}, (err, results) => {
        should.not.exist(err);
        results.should.equal(defaultResults);
        done();
      });
    });

    it('should flag the results as "from cache"', (done) => {
      solrClient.cache().search({}, (err) => {
        should.not.exist(err);

        solrClient.cache().search({}, (err, results) => {
          should.not.exist(err);
          results.should.have.property('__fromCache');
          results.__fromCache.should.be.true();
          done();
        });
      });
    });

  });

  describe('querying without cache', () => {

    it('should NOT cache a query when not asked', (done) => {
      solrClient.search({}, (err, results) => {
        should.not.exist(err);
        should(Cache.prototype.get.called).be.false();
        done();
      });
    });

    it('should NOT save the results to cache', (done) => {
      solrClient.search({}, (err, results) => {
        should.not.exist(err);
        Cache.prototype.set.called.should.be.false();
        done();
      });
    });

    it('should return the results', (done) => {
      solrClient.search({}, (err, results) => {
        should.not.exist(err);
        results.should.equal(defaultResults);
        done();
      });
    });

  });
});