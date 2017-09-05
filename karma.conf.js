const basePath = process.cwd();
const buble = require('rollup-plugin-buble');

module.exports = function(config) {
  config.set({
    autoWatch: true,
    basePath: basePath,
    // browsers: ['FirefoxDeveloper'],
    browsers: ['ChromeNoSandboxHeadless'],
    // browsers: ['Chrome'],
    // browsers: ['PhantomJS'],
    customLaunchers: {
      ChromeNoSandboxHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          // See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
          '--headless',
          '--disable-gpu',
          // Without a remote debugging port, Google Chrome exits immediately.
          ' --remote-debugging-port=9222'
        ]
      }
    },
    files: [
      'dist/webcomponents/custom-elements-es5-adapter.js',
      'dist/webcomponents/webcomponents-loader.js',
      //compoonent
      'dist/s-typeahead.js',

      //test files
      'src/**/*.test.js',
    ],
    frameworks: ['mocha', 'chai-sinon'],
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,
    preprocessors: {
      'src/**/test*.js': ['rollup']
    },
    reporters: ['spec'],
    rollupPreprocessor: {
      plugins: [buble()],
      format: 'iife',
      name: 'Tests' // won't accept moduleName
    }
  });
};
