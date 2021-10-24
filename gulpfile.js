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

gulp.task('styles:lib', () => {

    const libs_src = [
        'src/styles/lib/*.css',
        
        //'node_modules/lightgallery.js/dist/css/lightgallery.min.css',
        //'node_modules/lightgallery.js/dist/css/lg-transitions.min.css'
        //'node_modules/.../.../lib.min.css'
    ];

    return gulp.src(libs_src)
    .pipe(gulp.dest(cssBuildFolder+'/lib'))
    .pipe( connect.reload() );
});

gulp.task('scripts', function() {
    return gulp.src('src/scripts/*.js')
        .pipe( plumber() )
        .pipe( babel({
            presets: ['@babel/preset-env']
        }) )
        .pipe( gulp.dest(scriptsBuildFolder) )
        .pipe( connect.reload() );
});

gulp.task('scripts:lib', () => {

    const libs_src = [
        'src/scripts/lib/*.js',
        'node_modules/swiper/swiper-bundle.min.js'
        //'node_modules/lightgallery.js/        
    ];

    return gulp.src(libs_src)
    .pipe(gulp.dest(scriptsBuildFolder+'/lib'))
    .pipe( connect.reload() );
});

gulp.task('html',   function() { return gulp.src('src/**/*.html')   .pipe(gulp.dest(buildFolder))       
    .pipe( connect.reload() );
});
gulp.task('assets', function() { return gulp.src('src/assets/**/*') .pipe(gulp.dest(assetsBuildFolder)) 
    .pipe( connect.reload() );
});
//gulp.task('views',  function() { return gulp.src('src/**/*.twig')   .pipe(gulp.dest(viewsBuildFolder)); });


// Compile Twig templates to HTML
gulp.task('templates', function() {
    return gulp.src('src/**/*.twig') // run the Twig template parser on all .html files in the "src" directory
        //.pipe(twig('twig_data.json'))

        // each twig templates has a json that contains
        // its own sample data
        .pipe( data(function (file) {

            let hasBackslashes = file.path.includes('\\');
            let jsonpath = file.path.replace(/\\/g,"/").replace('src', 'src/data')+'.json';
            if (hasBackslashes) jsonpath =  jsonpath.replace(/\//g,"\\");
            let data = {};

            if (fs.existsSync(jsonpath))
                data = JSON.parse(fs.readFileSync(jsonpath));
    
            return data;
        }) )
        .pipe( twig( { base: __dirname + '/src/' } ) )
        .pipe( inject({ start: '/**--{{path}}--', end: '*/', prefix: __dirname,  removeTags: true}) )
        .pipe( gulp.dest(buildFolder+'/') ) // output the rendered HTML files to the "dist" directory
        .pipe( connect.reload() );
});


gulp.task('watch', function () {
    
    gulp.watch('src/styles/**/*.scss', gulp.series('sass', 'templates'));
    gulp.watch('src/assets/**/*', gulp.series('assets'));
    gulp.watch('src/scripts/**/*.js', gulp.series('scripts','scripts:lib'));    
    gulp.watch('src/**/*.twig', gulp.series('templates'));
    gulp.watch('src/**/*.html', gulp.series('templates'));
    gulp.watch('src/data/**/*.json', gulp.series('templates'));
    
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
    gulp.series('clean','sass','assets',
        gulp.parallel('scripts','scripts:lib', 'styles:lib' /* ,'html' */),
        gulp.series('templates')
    )
);

gulp.task('default',
    gulp.series('common-chain', gulp.parallel('connect', 'watch', 'browser') )
);

gulp.task('build', gulp.series('common-chain'));

