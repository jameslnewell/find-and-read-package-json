const readPackageJson = require('..');

const cache = {};

const transform = json => ({
  name: json.name,
  version: json.version
});

readPackageJson(__dirname, {cache, transform})
  .then(json => console.log(json))
  .catch(err => console.error(err))
;
