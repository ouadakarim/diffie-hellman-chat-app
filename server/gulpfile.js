var gulp = require('gulp');
var ts = require('gulp-typescript');
var clean = require('gulp-clean');
var server = require('gulp-develop-server');

var serverTS = ["**/*.ts", "!node_modules/**", '!bin/**'];


gulp.task('clean', function () {
    return gulp
        .src([
            'app.js',
            '**/*.js',
            '**/*.js.map',
            '!node_modules/**',
            '!gulpfile.js',
            '!bin/**',
            '!models/**',
            '!config/**',
        ], {read: false, allowEmpty: true})
        .pipe(clean())
});

gulp.task('ts', gulp.series('clean', function() {
    return gulp
        .src(serverTS, {base: './'})
        .pipe(ts({ module: 'commonjs' }))
        .pipe(gulp.dest('./'));
}));

gulp.task('server:start', gulp.series('ts', function() {
    server.listen({path: 'app'}, function(error) {
    });
}));

gulp.task('server:restart', gulp.series('ts', function() {
    server.restart();
}));

gulp.task('default', gulp.series('server:start', function() {
    gulp.watch(serverTS, ['server:restart']);
}));
