import * as fs from 'fs';
import * as path from 'path';

export interface Options {
  cache?: {[file: string]: any};
  transform?: (json: any) => any;
}

export default function findAndReadPackageJson(directory: string, options: Options = {}): Promise<{file: string; json: any}> {
  return new Promise((resolve, reject) => {
    const file = path.join(directory, 'package.json');
  
    // read the JSON from the cache
    if (typeof options.cache === 'object' && options.cache[file]) {
      resolve(options.cache[file]);
    }
  
    fs.readFile(file, (error, data) => {
  
      if (error) {
        
        // check if we're at the root of the filesystem
        if (directory === '/' || (process.platform === 'win32' && /^\w:[\\\/]*$/.test(directory))) {
  
          // we are already at the the root of the filesystem so there are no parent directories to look for
          // the `package.json` in
          reject(new Error(`No "package.json" file found in "${directory}".`));
  
        } else {
  
          // look for the `package.json` in the parent directory
          resolve(findAndReadPackageJson(path.dirname(directory), options));
  
        }
  
      } else {
  
        // parse the `package.json`
        let json = JSON.parse(data.toString());
  
        // transform the JSON
        if (typeof options.transform === 'function') {
          json = options.transform(json);
        }
  
        // write the JSON to the cache
        if (typeof options.cache === 'object') {
          options.cache[file] = json;
        }
  
        resolve({
          file,
          json
        });
  
      }
  
    });
  
  });
} 
