'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;
const readPackageJson = rewire('..');

describe('find-and-read-package-json', () => {

  const fs = {};
  readPackageJson.__set__('fs', fs);

  beforeEach(() => {
    fs.readFile = (path, cb) => cb(new Error('Mock fs.readFile() not set.'), null);
  });

  it('should return an object when package.json is found in the original directory', () => {

    fs.readFile = (path, cb) => {
      expect(path).to.be.equal('/root/foobar/package.json');
      cb(null, '{"name": "foobar", "version": "1.0.0"}');
    };

    return readPackageJson('/root/foobar')
      .then(json => expect(json).to.be.deep.equal({
        name: 'foobar',
        version: '1.0.0'
      }))
    ;

  });

  it('should return an object when package.json is found in the parent directory', () => {

    let count = 0;
    fs.readFile = (path, cb) => {
      ++count;
      if (count === 1) {
        cb(new Error(), null);
      } else {
        expect(path).to.be.equal('/root/package.json');
        cb(null, '{"name": "foobar", "version": "1.0.0"}');
      }
    };

    return readPackageJson('/root/foobar')
      .then(json => expect(json).to.be.deep.equal({
        name: 'foobar',
        version: '1.0.0'
      }))
    ;

  });

  it('should return an object when package.json is found in the root directory', () => {

    let count = 0;
    fs.readFile = (path, cb) => {
      ++count;
      if (count === 1 || count === 2) {
        cb(new Error(), null);
      } else {
        expect(path).to.be.equal('/package.json');
        cb(null, '{"name": "foobar", "version": "1.0.0"}');
      }
    };

    return readPackageJson('/root/foobar')
      .then(json => expect(json).to.be.deep.equal({
        name: 'foobar',
        version: '1.0.0'
      }))
    ;

  });

  it('should error when package.json is not found in any directory', () => {

    let count = 0;
    fs.readFile = (path, cb) => {
      cb(new Error(), null);
    };

    return readPackageJson('/root/foobar')
      .then(() => expect(false).to.be.true)
      .catch(err => expect(err).to.be.instanceof(Error))
    ;

  });

  it('should return a transformed object when a transform function is provided', () => {

    fs.readFile = (path, cb) => {
      cb(null, '{"name": "foobar", "version": "1.0.0"}');
    };

    const transform = json => `${json.name}@${json.version}`;

    return readPackageJson('/tmp/foobar', {transform})
      .then(json => expect(json).to.be.equal('foobar@1.0.0'))
    ;

  });

  it('should add the object to the cache when a cache object is provided and the package.json is found', () => {

    fs.readFile = (path, cb) => {
      cb(null, '{"name": "foobar", "version": "1.0.0"}');
    };

    const cache = {};

    return readPackageJson('/tmp/foobar', {cache})
      .then(json => expect(cache).to.have.property('/tmp/foobar/package.json').deep.equal({
        name: 'foobar',
        version: '1.0.0'
      }))
    ;

  });

  it('should add the transformed object to the cache when a cache object is provided and the package.json is found', () => {

    fs.readFile = (path, cb) => {
      cb(null, '{"name": "foobar", "version": "1.0.0"}');
    };

    const cache = {};
    const transform = json => `${json.name}@${json.version}`;

    return readPackageJson('/tmp/foobar', {cache, transform})
      .then(json => expect(cache).to.have.property('/tmp/foobar/package.json').equal('foobar@1.0.0'))
    ;

  });

  it('should not add the object to the cache when a cache object is provided and the package.json is not found', () => {

    fs.readFile = (path, cb) => {
      cb(new Error(), null);
    };

    const cache = {};

    return readPackageJson('/tmp/foobar', {cache})
      .then(() => expect(false).to.be.true)
      .catch(json => expect(cache).to.not.have.property('/tmp/foobar/package.json'))
    ;

  });

  it('should return an object from the cache when a cache object is provided and the package.json is cached', () => {

    const cache = {
      '/tmp/foobar/package.json': {
        name: 'foobar',
        version: '0.0.1'
      }
    };

    return readPackageJson('/tmp/foobar', {cache})
      .then(json => expect(json).to.be.equal(cache['/tmp/foobar/package.json']))
    ;

  });

});
