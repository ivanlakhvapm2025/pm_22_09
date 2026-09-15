const { src, dest, watch, series, parallel } = require('gulp');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// 1. Обробка HTML (з підтримкою file include)
function htmlTask() {
    return src('src/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('dist')) // автоматично створить папку dist
        .pipe(browserSync.stream()); // оновлює браузер
}

// 2. Компіляція SCSS у CSS з мініфікацією
function scssTask() {
    return src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

// 3. Обробка JavaScript (об'єднання і мініфікація)
function jsTask() {
    return src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}

// 4. Оптимізація зображень
function imgTask() {
    return src('src/imgs/**/*')
        .pipe(imagemin())
        .pipe(dest('dist/imgs'));
}

// 5. Локальний сервер (BrowserSync) для автоматичної синхронізації
function serve() {
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });
}

// 6. Створення watcher (відслідковування змін у проєкті)
function watchFiles() {
    watch('src/**/*.html', htmlTask);
    watch('src/scss/**/*.scss', scssTask);
    watch('src/js/**/*.js', jsTask);
    watch('src/imgs/**/*', imgTask);
}

// Запуск усіх завдань за замовчуванням
exports.default = series(
    parallel(htmlTask, scssTask, jsTask, imgTask), // спочатку збираємо проєкт
    parallel(serve, watchFiles)                    // потім запускаємо сервер і watcher
);