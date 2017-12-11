var gulp       = require('gulp'),
	sass         = require('gulp-sass'), 
	browserSync  = require('browser-sync'), 
	concat       = require('gulp-concat'), 
	uglify       = require('gulp-uglifyjs'), 
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'), 
	del          = require('del'), 
	svgstore     = require('gulp-svgstore'),
	svgmin       = require('gulp-svgmin'),	
	imagemin     = require('gulp-imagemin'),
	inject       = require('gulp-inject'), 
	pngquant     = require('imagemin-pngquant'), 
	cache        = require('gulp-cache'), 
	svgmin		 = require('gulp-svgmin'),
	autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function(){
	return gulp.src('app/sass/**/*.sass') 
		.pipe(sass()) 
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() { 
	browserSync({
		server: { 
			baseDir: 'app' 
		},
		notify: false
	});
});

gulp.task('scripts', function() {
	return gulp.src([ 
		// 'app/libs/jquery/dist/jquery.min.js', 
		// 'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' 
		])
		.pipe(concat('libs.min.js')) 
		.pipe(uglify()) 
		.pipe(gulp.dest('app/js'));
});

gulp.task('css-min', ['sass'], function() {
	return gulp.src([ 
		'app/css/libs.css',
		'app/css/main.css'
	]) 
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/css')); 
});


gulp.task('watch', ['browser-sync', 'css-min', 'scripts'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']); 
	gulp.watch('app/css/media.css', ['sass']); 
	gulp.watch('app/*.html', browserSync.reload); 
	gulp.watch('app/js/**/*.js', browserSync.reload);   
});

gulp.task('clean', function() {
	return del.sync('dist'); 
});
gulp.task('svgstore', function () {
    var svgs = gulp
        .src('app/svg/*.svg')
        .pipe(svgmin(function (file) {
            return {
                plugins: [{
                    cleanupIDs: {
                        minify: true
                    }
                }]
            }
        }))        
        .pipe(svgstore({ inlineSvg: true }));
 
    function fileContents (filePath, file) {
        return file.contents.toString();
    }	

    return gulp
        .src('app/*.html')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('app/'));
});


gulp.task('img', function() {
	return gulp.src('app/img/**/*') 
		.pipe(cache(imagemin({ 
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); 
});



gulp.task('build', ['clean', 'svgstore', 'img', 'sass', 'css-min', 'scripts'], function() {

	var buildCss = gulp.src([ 
		'app/css/main.min.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') 
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
