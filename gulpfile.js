const del = require('del');
const gulp = require('gulp');
const intercept = require('gulp-intercept');
const join = require('path').join;
const less = require('rollup-plugin-less');
const path = require('path');
const rename = require('gulp-rename');
const root = process.cwd();

gulp.task('clean', function() {
  return del(path.resolve(root, 'dist'));
});

gulp.task('vendor', () => {
  return Promise.all([
    gulp.src(join(root, 'node_modules', 'incremental-dom', 'dist', '*.*')).pipe(gulp.dest(join(root, 'dist', 'incremental-dom'))),
    gulp.src(['node_modules/@webcomponents/webcomponentsjs/webcomponents*.js', 'node_modules/@webcomponents/webcomponentsjs/custom*.js']).pipe(gulp.dest(join(root, 'dist', 'webcomponents'))),
  ]);
});

gulp.task('default', gulp.series('clean', gulp.parallel('vendor')));
