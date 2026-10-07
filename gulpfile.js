const concat = require('gulp-concat');
const { src, dest, watch, series, parallel } = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// Обробка HTML (з підтримкою file include)
function htmlTask() {
    return src('src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('dist')) // автоматично створить папку dist
        .pipe(browserSync.stream()); // оновлює браузер
}

// Компіляція SCSS у CSS з мініфікацією
function scssTask() {
    return src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

// Обробка JavaScript (об'єднання і мініфікація)
function jsTask() {
    return src('src/js/**/*.js')
        .pipe(concat('main.min.js')) 
        .pipe(uglify())             
        .pipe(dest('dist/js'))       
        .pipe(browserSync.stream());
}

// Оптимізація зображень
function imgTask() {
    return src('src/imgs/**/*', {encoding: false})
        .pipe(imagemin())
        .pipe(dest('dist/imgs'));
}

// Локальний сервер (BrowserSync) для автоматичної синхронізації
function serve() {
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });
}

// Створення watcher (відслідковування змін у проєкті)
function watchFiles() {
    watch('src/**/*.html', htmlTask);
    watch('src/scss/**/*.scss', scssTask);
    watch('src/js/**/*.js', jsTask);
    watch('src/imgs/**/*', imgTask);
}

// Копіювання CSS Bootstrap
function bootstrapCss() {
    return src('node_modules/bootstrap/dist/css/bootstrap.min.css')
        .pipe(dest('dist/css'));
}

// Копіювання JS Bootstrap
function bootstrapJs() {
    return src('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js')
        .pipe(dest('dist/js'));
}

// Запуск усіх завдань за замовчуванням
exports.default = series(
    parallel(htmlTask, scssTask, jsTask, imgTask, bootstrapCss, bootstrapJs), // спочатку збираємо проєкт
    parallel(serve, watchFiles)// потім запускаємо сервер і watcher
);