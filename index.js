'use strict';

var fs = require('fs');
var path = require('path');

const readPackageJson = (dir, options) => new Promise((resolve, reject) => {

  const file = path.join(dir, 'package.json');

  //read the JSON from the cache
  if (options && typeof options.cache === 'object' && options.cache[file]) {
    resolve(options.cache[file]);
  }

  fs.readFile(file, (err, data) => {

    if (err) {

      //check if we're at the root of the filesystem
      if (dir === '/' || (process.platform === 'win32' && /^\w:[\\\/]*$/.test(dir))) {

        //we are already at the the root of the filesystem so there are no parent directories to look for
        // the `package.json` in
        reject(new Error(`No "package.json" file found from "${dir}".`));

      } else {

        //look for the `package.json` in the parent directory
        resolve(readPackageJson(path.dirname(dir), options));

      }

    } else {

      //parse the `package.json`
      let json = JSON.parse(data.toString());

      //transform the JSON
      if (options && typeof options.transform === 'function') {
        json = options.transform(json);
      }

      //write the JSON to the cache
      if (options && typeof options.cache === 'object') {
        options.cache[file] = json;
      }

      resolve(json);

    }

  });

});

module.exports = readPackageJson;