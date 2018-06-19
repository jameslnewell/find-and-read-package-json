import findAndReadPackageJSON from '../src';

const directory = process.argv[4] || process.cwd();

const cache = {};

const transform = (json: any) => ({
  name: json.name,
  version: json.version
});

findAndReadPackageJSON(directory, {cache, transform})
  .then(({file, json}) => console.log(file, json))
  .catch(error => console.error(error))
; 
