/**
 * truck-orm
 * gulpfile.babel.js
 */

import pkg from './package.json'
import path from 'path'
import gulp from 'gulp'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import del from 'del'
import {argv} from 'yargs'
import browserify from 'browserify'
import stringify from 'stringify'
import watchify from 'watchify'
import babelify from 'babelify'
import browserSync from 'browser-sync'

const $ = require('gulp-load-plugins')()

/**
 * Arguments
 */
const ARGS = {
    production: argv.production,
    sourcemaps: argv.sourcemaps
}

/**
 * Paths
 */
const PATHS = {
    src: './example/example-client/src',
    build: './example/example-client/build'
}

/**
 * Config
 */
const CONFIG = {
    // proxyHost: 'localhost:8095'
}

/**
 * Task: Build
 * Build production ready version of the app.
 */
gulp.task('build', gulp.series(
    // clean,
    // gulp.parallel(
    //     bundleApp,
    //     sass,
    //     copy
    // ),
    // size
))

/**
 * Task: Watch
 * build complete app, start development server &
 * watch for changes.
 */
gulp.task('watch', gulp.series(
    clean,
    gulp.parallel(
        bundleAppAndWatch,
        sass,
        copy
    ),
    server,
    watch
))

/**
 * Bundle app with ./src/index.js as the
 * entry point.
 *
 * @return {stream}
 */
function bundleApp () {
    return bundle(src('index.js'))
}

/**
 * Use browserify to bundle the application..
 *
 * @param  {string} entry - Path to entry file
 *
 * @return {stream}
 */
function bundle (entry) {
    let bundler = browserify(entry, {debug: ARGS.sourcemaps})

    bundler.transform(stringify, {
        appliesTo: { includeExtensions: ['.html', '.svg'] },
        minifyAppliesTo: { includeExtensions: ['.html', '.svg'] },
        minify: true
    })
    bundler.transform(babelify.configure({
        presets: ['es2015']
    }))

    return bundler
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
            .pipe($.if(ARGS.sourcemaps, $.sourcemaps.init({loadMaps: true})))
                .pipe($.ngAnnotate())
                .pipe($.uglify())
            .pipe($.if(ARGS.sourcemaps, $.sourcemaps.write('./')))
            .pipe(gulp.dest(PATHS.build))
}

/**
 * Bundle app with ./src/index.js as the
 * entry point, watch for changes and rebundle.
 *
 * @return {stream}
 */
function bundleAppAndWatch () {
    return watchBundle(src('index.js'))
}

/**
 * Use watchify / browserify to bundle the
 * application, watch for changes and rebundle.
 *
 * @param  {string} entry - Path to entry file
 *
 * @return {stream}
 */
function watchBundle (entry) {
    let options = watchify.args
    options.debug = true

    let bundler = watchify(browserify(entry, options))

    bundler.transform(stringify, {
        appliesTo: { includeExtensions: ['.html', '.svg'] },
        minifyAppliesTo: { includeExtensions: ['.html', '.svg'] },
        minify: true
    })
    bundler.transform(babelify.configure({
        presets: ['es2015']
    }))

    function rebundle () {
        return bundler
            .bundle()
            .on('error', errorHandler)
            .pipe(source('bundle.js'))
            .pipe(buffer())
                .pipe($.sourcemaps.init({loadMaps: true}))
                .pipe($.sourcemaps.write('./'))
                .pipe(gulp.dest(PATHS.build))
                .pipe(browserSync.stream())
    }

    bundler.on('update', rebundle)
    return rebundle()
}

/**
 * Watch for changes to certain files and
 * run appropriate tasks,
 *
 * @param  {Function} done
 *
 * @return {stream}
 */
function watch (done) {
    gulp.watch([
        src('index.html')
    ], copy)

    gulp.watch([
        src('**/*.scss')
    ], sass)

    done()
}

/**
 * Copy files into build dir.
 *
 * @return {void}
 */
function copy () {
    const glob = [
        src('index.html')
    ]

    return gulp.src(glob)
        .pipe($.htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(PATHS.build))
        .pipe(browserSync.stream())
}

/**
 * Compile sass.
 *
 * @return {stream}
 */
function sass () {
    const glob = src('*.scss')

    return gulp.src(glob)
        .pipe($.if(ARGS.sourcemaps, $.sourcemaps.init()))
            .pipe($.plumber(errorHandler))
            .pipe($.sass({
                outputStyle: ARGS.production ? 'compressed' : undefined
            }))
            .pipe($.autoprefixer())
            .pipe($.concat('bundle.css'))
        .pipe($.if(ARGS.sourcemaps, $.sourcemaps.write('./')))
        .pipe(gulp.dest(PATHS.build))
        .pipe(browserSync.stream({ match: '**/*.css' }))
}

/**
 * Delete build dir.
 *
 * @return {void}
 */
function clean () {
    return del(PATHS.build)
}

/**
 * Start node server (server.js) & BrowserSync.
 *
 * @param  {function} done
 *
 * @return {stream}
 */
function server (done) {
    let options = {
        browser: 'google chrome',
        port: 3095,
        online: false,
        logSnippet: false,
        notify: false,
        ghostMode: false,
        server: {
            baseDir: PATHS.build
        }
    }

    if (CONFIG.proxyHost) {
        options.proxy = CONFIG.proxyHost
        delete options.server

        $.nodemon({
            script: './server.js',
            ignore: ['**.*']
        })
    }

    browserSync(options)
    done()
}

/**
 * Log the size of files in build dir.
 *
 * @return {stream}
 */
function size () {
    const glob = path.join(PATHS.build, '*')

    return gulp.src(glob)
        .pipe($.size({showFiles: true}))
        .pipe($.size({gzip: true}))
}

/**
 * gulp-plumber errorHandler.
 *
 * @param  {string} err
 *
 * @return {this}
 */
function errorHandler (err) {
    $.util.beep()
    $.util.log($.util.colors.red(err))
    this.emit('end')
    return this
}

/**
 * Helper to join file path with src path
 *
 * @param  {string} p Filepath
 *
 * @return {string}
 */
function src (p) {
    return path.join(PATHS.src, p)
}
