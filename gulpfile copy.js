var gulp     = require('gulp'),                       // base
    sass     = require('gulp-sass')(require('sass')), // processes scss files    
    concat   = require('gulp-concat'),                // to merge files
    del      = require('del'),                        // deletes old dist files
    connect  = require('gulp-connect'),               // creates a local server
    open     = require('gulp-open'),                  // to open a browser istance        
    twig     = require('gulp-twig'),
    data     = require('gulp-data'),    
    babel    = require('gulp-babel'),
    cleanCSS = require('gulp-clean-css'),
    plumber  = require('gulp-plumber'),
    fs       = require('fs'),
    inject   = require('gulp-inject-partials');// injects a text in a file (used for ATF injection)



var buildFolder = 'dist/',
    cssBuildFolder, scriptsBuildFolder, assetsBuildFolder, viewsBuildFolder;

const setFolders = (folder = 'static/') => {
    buildFolder = folder;
    cssBuildFolder = buildFolder + 'styles/';
    scriptsBuildFolder = buildFolder + 'scripts/';
    assetsBuildFolder = buildFolder + 'assets/';
    viewsBuildFolder = buildFolder + 'views/';
}

setFolders(buildFolder);

// task to delete each file in the dist directory
gulp.task('clean', () => del([cssBuildFolder, scriptsBuildFolder, assetsBuildFolder, buildFolder + '*.html']));


// task to compile SASS scripts,
// create the css files and reload the page
gulp.task('sass', () =>
    gulp.src(['src/styles/**/*.scss'])
    .pipe(sass({
        includePaths: [],
        outputStyle: 'compressed',
        precision: 9
    }).on('error', sass.logError))
    .pipe(cleanCSS({debug: true}, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize);
        console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe(concat('main.css'))
    .pipe(gulp.dest(cssBuildFolder))
    .pipe( connect.reload() )
);

gulp.task('html',   function() { return gulp.src('src/**/*.html')   .pipe(gulp.dest(buildFolder))       
    .pipe( connect.reload() );
});

gulp.task('assets', function() { return gulp.src('src/assets/**/*') .pipe(gulp.dest(assetsBuildFolder)) 
    .pipe( connect.reload() );
});


gulp.task('watch', function () {
    
    gulp.watch('src/styles/**/*.scss', gulp.series('sass', 'html'));
    gulp.watch('src/assets/**/*',      gulp.series('assets'));
    gulp.watch('src/**/*.html',        gulp.series('templates') );
    gulp.watch('src/data/**/*.json',   gulp.series('templates') );
    
});


gulp.task('connect', function() {
    connect.server({
        root: buildFolder,
        port: 9080,
        livereload: true
    });
});

gulp.task('browser', function(){
    gulp.src(buildFolder + 'index.html')
        .pipe(open({uri: 'http://localhost:9080'}));
});


gulp.task('common-chain',
    gulp.series( 'clean','sass','assets', 'html' )    
);

gulp.task('default',
    gulp.series('common-chain', gulp.parallel( 'connect', 'watch', 'browser' ) )
);

xxxxxx

