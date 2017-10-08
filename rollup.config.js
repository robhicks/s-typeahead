const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const nodeResolve = require('rollup-plugin-node-resolve');
const path = require('path');
const root = process.cwd();
const string = require('rollup-plugin-string');
const uglify = require('rollup-plugin-uglify');

require('events').EventEmitter.defaultMaxListeners = 0;

let input = path.resolve(root, 'src', 's-typeahead.js');
let plugins = [
  string({include: 'src/**/*.css'}),
  buble()
];
let globals = [];

export default [
  {
    input,
    plugins,
    globals,
    name: 'STypeahead',
    output: {
      file: path.resolve(root, 'dist', 's-typeahead.iife.js'),
      format: 'iife'
    }
  },
  {
    input,
    plugins,
    globals,
    output: {
      file: path.resolve(root, 'dist', 's-typeahead.cjs.js'),
      format: 'cjs'
    }
  },
  {
    input,
    output: {
      file: path.resolve(root, 'dist', 's-typeahead.mjs'),
      format: 'es'
    }
  }
];
