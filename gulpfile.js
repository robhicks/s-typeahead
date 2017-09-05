const del = require('del');
const gulp = require('gulp');
const intercept = require('gulp-intercept');
const join = require('path').join;
const less = require('rollup-plugin-less');
const path = require('path');
const rename = require('gulp-rename');
const root = process.cwd();
const superviews = require('superviews.js');


gulp.task('clean', function() {
  return del(path.resolve(root, 'dist'));
});

gulp.task('vendor', () => {
  return Promise.all([
    gulp.src(join(root, 'node_modules', 'incremental-dom', 'dist', '*.*')).pipe(gulp.dest(join(root, 'dist', 'incremental-dom'))),
    gulp.src(['node_modules/@webcomponents/webcomponentsjs/webcomponents*.js', 'node_modules/@webcomponents/webcomponentsjs/custom*.js']).pipe(gulp.dest(join(root, 'dist', 'webcomponents'))),
  ]);
});

gulp.task('superviews', () => {
  return gulp.src('./src/**/template.html', {base: './src'})
    .pipe(intercept((file) => {
      file.contents = new Buffer(superviews(file.contents.toString(), 'render', 'ctrl', 'es6'));
      return file;
    }))
    .pipe(rename((pth) => {
      pth.extname = '.js';
    }))
    .pipe(gulp.dest("./src"));
});

gulp.task('watch:html', () => {
  return gulp.watch(['src/**/*.html'], gulp.series('superviews'));
});

gulp.task('build', gulp.series('superviews'));

gulp.task('default', gulp.series('clean', gulp.parallel('vendor', 'superviews'), 'watch:html'));
