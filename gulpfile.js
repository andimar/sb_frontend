var gulp     = require('gulp'),                       // base
    sass     = require('gulp-sass')(require('sass')), // processes scss files    
    concat   = require('gulp-concat'),                // to merge files
    del      = require('del'),                        // deletes old dist files
    connect  = require('gulp-connect'),               // creates a local server
    open     = require('gulp-open'),                  // to open a browser istance        
    twig     = require('gulp-twig'),
    data     = require('gulp-data'),        
    cleanCSS = require('gulp-clean-css'),
    plumber  = require('gulp-plumber'),
    terser   = require('gulp-terser-js'),
    fs       = require('fs'),
    bump = require('gulp-bump'),
    git  = require('gulp-git'),
    filter = require('gulp-filter'),
    argv = require('yargs')
        .option('type', {
            alias: 't',
            choices: ['patch', 'minor', 'major']
        }).argv,
    tag = require('gulp-tag-version'),
    push = require('gulp-git-push'),
    inject   = require('gulp-inject-partials');// injects a text in a file (used for ATF injection)


var version          = '';
var current_version  = '';  

var buildFolder = 'dist/',
    cssBuildFolder, scriptsBuildFolder, assetsBuildFolder, viewsBuildFolder;


const setFolders = (folder = 'dist/') => {
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
        'node_modules/swiper/swiper-bundle.min.css'
        //'node_modules/lightgallery.js/dist/css/lightgallery.min.css',
        //'node_modules/lightgallery.js/dist/css/lg-transitions.min.css'
        //'node_modules/.../.../lib.min.css'
    ];

    return gulp.src(libs_src)
    .pipe(gulp.dest(cssBuildFolder+'/lib'))
    .pipe( connect.reload() );
});


gulp.task('scripts', function() {
    return gulp.src('src/scripts/**/*.js')

        .pipe( terser({ // reterefnce --> https://terser.org/docs/api-reference#mangle-options
            
            mangle: false

        }))
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




// Compile Twig to HTML pages for live preview
gulp.task('html-preview', function() {

    let pages = [
        'src/index.twig'
    ];

    return gulp.src(pages)
        
        // each twig page has a json that contains its own sample data
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
        
        /// serve per aggiungere gli atf
        .pipe( inject({ start: '/**--{{path}}--', end: '*/', prefix: __dirname,  removeTags: true}) )

        .pipe( gulp.dest(`${buildFolder}/`) ) // output the rendered HTML files to the "dist" directory
        .pipe( connect.reload() );
});


// Copy Twig templates to dist
gulp.task('templates', function() {
    return gulp.src('src/**/*.twig') 

        .pipe( inject({ start: '/**--{{path}}--', end: '*/', prefix: __dirname,  removeTags: true}) )
        .pipe( gulp.dest(buildFolder+'/templates/') ) // output the rendered twig files to the "dist" directory
        .pipe( connect.reload() );
});


gulp.task('watch', function () {
    
    gulp.watch('src/styles/**/*.scss', gulp.series('sass', 'html-preview'));
    gulp.watch('src/assets/**/*', gulp.series('assets'));
    gulp.watch('src/scripts/**/*.js', gulp.series('scripts','scripts:lib'));    
    gulp.watch('src/**/*.twig', gulp.series('html-preview','templates'));
    gulp.watch('src/**/*.html', gulp.series('html-preview', 'templates'));
    gulp.watch('src/data/**/*.json', gulp.series('html-preview', 'templates'));    
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

var getPackageJson = function () {
    return JSON.parse( fs.readFileSync('./package.json', 'utf8'));
};


/** 
 * Imposta le variabili di versione attuali leggendole dal package-json
 */
gulp.task('version', () => { 

    // setFolders( staticFolder );

    const pkg = getPackageJson();
    version         = pkg.version;
    current_version = pkg.version.replace(/\./g,'_');  // serve trasformare i punti in underscore per l'injection;
    
    return gulp.src('src/');
} );



/**
 * Modifica la versione del progetto
 * prende l'opzione -t per stabilire il tipo di avanzamento 
 * 'patch' ( default ), 'minor', 'major'
 */
gulp.task( 'bump', function () {

    return gulp.src('package.json')
           .pipe( bump( { type: argv.type || 'patch' }) )
           .pipe( gulp.dest('./') );
           
});

/**
 * aggiunge i nuovi file elaborati con git add
 * e poi fa il commit utilizzando la nuova versione
 */
gulp.task( 'commit', function() {

    return gulp.src( [ buildFolder + '*', 'package.json' ] )
        .pipe( git.add({args: '-f'}) ) // Run git add
        .pipe( git.commit( `Bump to version ${ version }` ))        
        .pipe( filter('package.json')) // filtra il solo package.json        
        .pipe( tag() )                 // così tag prende solo la versione del package.json
        .pipe( push({                      
            repository: 'origin',
            refspec: 'HEAD'
        }) );
}.bind( this ) );









gulp.task('common-chain',
    gulp.series('clean','sass','assets',
        gulp.parallel('scripts','scripts:lib', 'styles:lib' /* ,'html' */),
        gulp.series('html-preview', 'templates')
    )
);

gulp.task('default',
    gulp.series('common-chain', gulp.parallel('connect', 'watch', 'browser') )
);

gulp.task('build', gulp.series('common-chain'));



// updates version and saves file in the /static folder
gulp.task('build-bump',  gulp.series('bump', 'version', 'common-chain', 'commit'));

