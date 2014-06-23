var gulp = require('gulp');

gulp.task('build', function() {
	var rename = require('gulp-rename'),
		uglify = require('gulp-uglify'),
		header = require('gulp-header'),
		pkg = require('./package.json'),
        jshint = require('gulp-jshint'),
        banner = ['/**',
	              ' * <%= pkg.name %> - <%= pkg.description %>',
	              ' * @version v<%= pkg.version %>',
	              ' * @link <%= pkg.homepage %>',
	              ' * @license <%= pkg.license %>',
	              ' * @author <%= pkg.author %>',
	              ' */',
	              ''].join('\n');

	return gulp.src('src/angular-mixin.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
		.pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('example/js/'))
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('dist'))
        .pipe(gulp.dest('example/js/'));
});