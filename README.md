# find-and-read-package-json

Find and read data from a `package.json` file.

## Installation

```bash
npm install --save find-and-read-package-json
```

## Usage

```js

import findAndReadPackageJSON from 'find-and-read-package-json';

findAndReadPackageJSON(process.cwd())
  .then(({file, json}) => console.log(file, json))
  .catch(error => console.error(error))
;

```

## API

```js
findAndReadPackageJSON(directory: string, options: Options): Promise<{file: string; json: any}>
```

Find and read data from a `package.json` file that exists in the provided directory, or that exists in a parent
directory of the provided directory.

##### Parameters

- `directory`: `string` - Required. The directory we will start looking for a `package.json` file in.
- `options`
  - `cache`: `{[file: string]: any}` - Optional. An object shared between calls to `findAndReadPackageJSON()` to reduce repeated
  calls to
   `fs
  .readFile()`.
  - `transform`: `(json : any) => any` Optional. A function to transform the JSON read from a `package.json` file (to save large chunks of JSON from being cached).