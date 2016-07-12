# find-and-read-package-json

Find and read data from a `package.json` file.

## Installation

```bash
npm install --save find-and-read-package-json
```

## Usage

```javascript

const findAndReadPackageJson = require('find-and-read-package-json');

findAndReadPackageJson(__dirname)
  .then(json => console.log(json))
  .catch(err => console.error(err))
;

```

## API

```js
findAndReadPackageJson(dir, options)
```

Find and read data from a `package.json` file that exists in the provided directory, or that exists in a parent
directory of the provided directory.

###### Parameters

- `dir : string` - Required. The directory to start looking for a `package.json` file in.
- `options : object` - Optional. The additional options.
  - `cache : object` - Optional. An object shared between calls to `findAndReadPackageJson()` to reduce repeated
  calls to
   `fs
  .readFile()`.
  - `transform : function(json : object)` Optional. A function to transform the JSON read from a `package.json` file.