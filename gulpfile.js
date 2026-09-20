const gulp = require('gulp');
const del = require('del');
const connect = require('gulp-connect');
const open = require('gulp-open');
const twig = require('gulp-twig');
const data = require('gulp-data');
const terser = require('gulp-terser-js');
const fs = require('fs');
const inject = require('gulp-inject-partials');
const { spawn } = require('child_process');
const path = require('path');

const buildFolder = 'dist/';
const cssBuildFolder = buildFolder + 'styles/';
const scriptsBuildFolder = buildFolder + 'scripts/';
const assetsBuildFolder = buildFolder + 'assets/';

gulp.task('clean', () => del([
    cssBuildFolder,
    scriptsBuildFolder,
    assetsBuildFolder,
    buildFolder + 'templates/',
    buildFolder + '*.html',
]));

gulp.task('tailwind', function tailwind() {
    const executable = path.join(__dirname, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
    return spawn(process.execPath, [executable,
        '-i', 'src/styles/tailwind.css',
        '-o', cssBuildFolder + 'tailwind.css',
        '--minify',
    ], { stdio: 'inherit' });
});

gulp.task('styles:lib', () => gulp.src([
    'src/styles/lib/*.css',
    'node_modules/swiper/swiper-bundle.min.css',
]).pipe(gulp.dest(cssBuildFolder + 'lib')).pipe(connect.reload()));

gulp.task('scripts', () => gulp.src('src/scripts/**/*.js')
    .pipe(terser({ mangle: false }))
    .pipe(gulp.dest(scriptsBuildFolder))
    .pipe(connect.reload()));

gulp.task('scripts:lib', () => gulp.src([
    'src/scripts/lib/*.js',
    'node_modules/swiper/swiper-bundle.min.js',
]).pipe(gulp.dest(scriptsBuildFolder + 'lib')).pipe(connect.reload()));

gulp.task('assets', () => gulp.src('src/assets/**/*')
    .pipe(gulp.dest(assetsBuildFolder))
    .pipe(connect.reload()));

gulp.task('html-preview', () => gulp.src(['src/index.twig'])
    .pipe(data(file => {
        let jsonPath = file.path.replace(/\\/g, '/').replace('src', 'src/data') + '.json';
        if (file.path.includes('\\')) jsonPath = jsonPath.replace(/\//g, '\\');
        return fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath)) : {};
    }))
    .pipe(twig({ base: __dirname + '/src/' }))
    .pipe(inject({ start: '/**--{{path}}--', end: '*/', prefix: __dirname, removeTags: true }))
    .pipe(gulp.dest(buildFolder))
    .pipe(connect.reload()));

gulp.task('templates', () => gulp.src('src/**/*.twig')
    .pipe(inject({ start: '/**--{{path}}--', end: '*/', prefix: __dirname, removeTags: true }))
    .pipe(gulp.dest(buildFolder + 'templates/'))
    .pipe(connect.reload()));

gulp.task('watch', () => {
    gulp.watch(['src/styles/tailwind.css', 'src/**/*.twig', 'src/**/*.js'], gulp.series('tailwind'));
    gulp.watch('src/assets/**/*', gulp.series('assets'));
    gulp.watch('src/scripts/**/*.js', gulp.series('scripts', 'scripts:lib'));
    gulp.watch('src/**/*.twig', gulp.series('html-preview', 'templates'));
    gulp.watch('src/data/**/*.json', gulp.series('html-preview', 'templates'));
});

gulp.task('connect', () => connect.server({ root: buildFolder, port: 9080, livereload: true }));
gulp.task('browser', () => gulp.src(buildFolder + 'index.html').pipe(open({ uri: 'http://localhost:9080' })));

gulp.task('common-chain', gulp.series(
    'clean',
    'assets',
    gulp.parallel('scripts', 'scripts:lib', 'styles:lib', 'tailwind'),
    'templates',
));
gulp.task('default', gulp.series('common-chain', 'html-preview', gulp.parallel('connect', 'watch', 'browser')));
gulp.task('build', gulp.series('common-chain'));
