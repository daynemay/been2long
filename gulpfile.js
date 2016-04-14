var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    exit = require('gulp-exit');

gulp.task('default', function () { 
    return gulp.src('tests/*.html').pipe(qunit().pipe(exit()));
});
