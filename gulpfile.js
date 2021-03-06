var gulp = require('gulp'),
    gutil = require('gulp-util'),
    stylish = require('gulp-jsbeautifier'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    w3cjs = require('gulp-w3cjs'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    concat = require('gulp-concat');

var env,
    jsSources,
    sassSources,
    htmlSources,
    outputDir,
    lineComments,
    sassStyle;

env = 'development';

if (env==='development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
    lineComments = true;

} else {
    outputDir = 'builds/production/';
    sassStyle = 'nested';
    lineComments = false;
}

jsSources = [
    'components/scripts/jquery.bxslider.min.js',
    'components/scripts/jquery.slicknav.min.js'
];

sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];

gulp.task('js', function() {
    'use strict';

    gulp.src('components/scripts/script.js')
        .pipe(jshint('./.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'));


    gulp.src(jsSources)
        .pipe(concat('plugins.js'))
        .pipe(browserify())
        .on('error', gutil.log)
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload());
});

gulp.task('compass', function() {
    'use strict';
    gulp.src(sassSources)
        .pipe(compass({
            sass: 'components/sass',
            css: outputDir + 'css',
            image: outputDir + 'images',
            style: sassStyle,
            comments: lineComments,
            require: ['susy', 'breakpoint']
        })
            .on('error', gutil.log))
        // .pipe(gulp.dest( outputDir + 'css'))
        .pipe(connect.reload());
});



gulp.task('watch', function() {
    'use strict';
    gulp.watch(jsSources, ['js']);
    gulp.watch(['components/sass/*.scss', 'components/sass/*/*.scss'], ['compass']);
    gulp.watch('builds/development/*.html', ['html']);
});

gulp.task('connect', function() {
    'use strict';
    connect.server({
        root: outputDir,
        livereload: true
    });
});

gulp.task('html', function() {
    'use strict';
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload());
});

// Copy images to production
gulp.task('move', function() {
    'use strict';
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env === 'production', gulp.dest(outputDir+'images')));
});

gulp.task('default', ['watch', 'html', 'js', 'compass', 'move', 'connect']);
