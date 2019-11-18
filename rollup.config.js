const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const nodeResolve = require('rollup-plugin-node-resolve');
const path = require('path');
const root = process.cwd();
const uglify = require('rollup-plugin-uglify');

require('events').EventEmitter.defaultMaxListeners = 0;

let input = path.resolve(root, 'src', 's-typeahead.js');
let plugins = [];
let globals = {
  's-utilities': 'SUtilities'
};
let external = ['s-utilities'];

export default [
  {
    external,
    input,
    plugins,
    output: {
      name: 'STypeahead',
      file: path.resolve(root, 'dist', 's-typeahead.iife.js'),
      format: 'iife',
      globals
    }
  },
  {
    external,
    input,
    plugins,
    output: {
      file: path.resolve(root, 'dist', 's-typeahead.cjs.js'),
      format: 'cjs'
    }
  },
  {
    external,
    input,
    output: {
      file: path.resolve(root, 'dist', 's-typeahead.mjs'),
      format: 'es'
    }
  },
  {
    input,
    plugins: [nodeResolve()],
    output: {
      file: path.resolve(root, 'dist', 's-typeahead.test.mjs'),
      format: 'es'
    }
  }
];
