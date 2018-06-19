jest.mock('fs');
import * as fs from 'fs';
import findAndReadPackageJSON from '../src';

function __setReadFile(method: (path: string, cb: (err: null | Error, data: null |Buffer) => void) => void) {
  Object.defineProperty(fs, 'readFile', {
    value: jest.fn(method),
    writable: true
  });
}

describe('find-and-read-package-json', () => {

  beforeEach(() => {
    __setReadFile((path, cb) => cb(new Error('Mock fs.readFile() not set.'), null));
  });

  it('should return an object when package.json is found in the original directory', async () => {
    __setReadFile((path, cb) => {
      expect(path).toEqual('/root/foobar/package.json');
      cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
    });

    const {file, json} = await findAndReadPackageJSON('/root/foobar');
    expect(file).toEqual('/root/foobar/package.json');
    expect(json).toEqual({
      name: 'foobar',
      version: '1.0.0'
    });

  });

  it('should return an object when package.json is found in the parent directory', async () => {
    let count = 0;
    __setReadFile((path, cb) => {
      ++count;
      if (count === 1) {
        cb(new Error(), null);
      } else {
        expect(path).toEqual('/root/package.json');
        cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
      }
    });

    const {file, json} = await findAndReadPackageJSON('/root/foobar');
    expect(file).toEqual('/root/package.json');
    expect(json).toEqual({
      name: 'foobar',
      version: '1.0.0'
    });

  });

  it('should return an object when package.json is found in the root directory', async () => {

    let count = 0;
    __setReadFile((path, cb) => {
      ++count;
      if (count === 1 || count === 2) {
        cb(new Error(), null);
      } else {
        expect(path).toEqual('/package.json');
        cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
      }
    });

    const {file, json} = await findAndReadPackageJSON('/root/foobar');
    expect(file).toEqual('/package.json');
    expect(json).toEqual({
      name: 'foobar',
      version: '1.0.0'
    });

  });

  it('should error when package.json is not found in any directory', async () => {

    __setReadFile((path, cb) => {
      cb(new Error(), null);
    });

    expect.assertions(1);
    try {
      await findAndReadPackageJSON('/root/foobar');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
    
  });

  it('should return a transformed object when a transform function is provided', async () => {

    __setReadFile((path, cb) => {
      cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
    });

    const transform = (j: any) => `${j.name}@${j.version}`;

    const {file, json} = await findAndReadPackageJSON('/root/foobar', {transform});
    expect(json).toEqual('foobar@1.0.0');

  });

  it('should add the object to the cache when a cache object is provided and the package.json is found', async () => {
    __setReadFile((path, cb) => {
      cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
    });

    const cache = {};

    const {file, json} = await findAndReadPackageJSON('/root/foobar', {cache});
    expect(cache).toEqual({
      '/root/foobar/package.json': {
        name: 'foobar',
        version: '1.0.0'
      }
    });
  });

  it('should add the transformed object to the cache when a cache object is provided and the package.json is found', async () => {
    __setReadFile((path, cb) => {
      cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
    });

    const cache = {};
    const transform = (j: any) => `${j.name}@${j.version}`;

    const {file, json} = await findAndReadPackageJSON('/root/foobar', {cache, transform});
    expect(cache).toEqual({
      '/root/foobar/package.json': 'foobar@1.0.0'
    });

  });

  it('should not add the object to the cache when a cache object is provided and the package.json is not found', async () => {

    __setReadFile((path, cb) => {
      cb(new Error(), null);
    });


    const cache = {};

    expect.assertions(1);
    try {
      await findAndReadPackageJSON('/root/foobar', {cache});
    } catch (error) {
      expect(cache).not.toHaveProperty('/root/foobar/package.json');
    }

  });

  it('should return an object from the cache when a cache object is provided and the package.json is cached', async () => {
    __setReadFile((path, cb) => {
      cb(null, Buffer.from('{"name": "foobar", "version": "1.0.0"}', 'utf8'));
    });

    const cache: {[file: string]: any} = {
      '/root/foobar/package.json': {
        name: 'foobar',
        version: '0.0.1'
      }
    };

    expect.assertions(1);
    const {file, json} = await findAndReadPackageJSON('/root/foobar', {cache});
    expect(json).toEqual(cache['/tmp/foobar/package.json']);

  });

});
