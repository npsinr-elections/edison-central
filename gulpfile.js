const gulp = require("gulp"),
    ts = require("gulp-typescript"),
    uglify = require("gulp-uglify"),
    browserify = require("browserify"),
    tsify = require("tsify"),
    source = require("vinyl-source-stream"),
    rename = require("gulp-rename"),
    sourcemaps = require("gulp-sourcemaps"),
    buffer = require("vinyl-buffer"),
    mocha = require("gulp-mocha");

const SRC = 0;
const DEST = 1;

const serverPaths = {
    TS: ["src/server/**/*.ts", "build/server"]
};

const sharedPaths = {
    TS: ["src/shared/**/*.ts", "build/shared"]
};

const clientPaths = {
    HTML: ["src/client/views/*.html", "build/client/views"],
    CSS: ["src/client/assets/styles/*.css", "build/client/assets/styles"],
    JS: ["src/client/assets/scripts/*.{js,map}", "build/client/assets/scripts"],
    fonts: ["src/client/assets/fonts/*", "build/client/assets/fonts"],
    images: ["src/client/assets/images/*", "build/client/assets/images"],
    TS: ["src/client/assets/scripts", "build/client/assets/scripts"]
};

const launcherPath = ["src/main.ts", "build"];
const configPath = ["src/config.ts", "build"];
const testPath = ["src/test/**/*.ts", "build/test"];

function tsBuilder(paths) {
    return function builder(done) {
        let failed = false;
        return gulp.src(paths[SRC])
            .pipe(sourcemaps.init())
            .pipe(ts.createProject("./tsconfig.json")(ts.reporter.fullReporter()))
            .once("error", function () {
                this.once("finish", () => process.exit(1));
              })
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest(paths[DEST]));
    };
}

function mover(paths) {
    return function mover(done) {
        return gulp.src(paths[SRC])
            .pipe(gulp.dest(paths[DEST]));
    };
}

function clientTsBuilders() {
    let entries = ["index.ts", "passwordForm.ts"];

    return gulp.parallel(
        entries.map((entry) => {
            return function tsBuilder (done) {
                console.log(`Building ${entry}`);
                return browserify({
                    basedir: clientPaths.TS[SRC],
                    debug: true,
                    entries: [entry],
                    cache: {},
                    packageCache: {}
                })
                    .plugin(tsify, {files: []})
                    .bundle()
                    .pipe(source(entry))
                    .pipe(buffer())
                    .pipe(sourcemaps.init({loadMaps: true}))
                    .pipe(rename({
                        extname: ".bundle.js"
                    }))
                    .pipe(sourcemaps.write(".", {sourceRoot: "src/client/assets/scripts"}))
                    .pipe(gulp.dest(clientPaths.TS[DEST]));
            };
        })
    );
}

gulp.task("server", gulp.parallel([
    tsBuilder(serverPaths.TS),
    tsBuilder(sharedPaths.TS)
]));



gulp.task("client", gulp.parallel(
    clientTsBuilders(),
    mover(clientPaths.HTML),
    mover(clientPaths.CSS),
    mover(clientPaths.JS),
    mover(clientPaths.fonts)
));

gulp.task("launcher", gulp.parallel(
    tsBuilder(launcherPath)
));

gulp.task("config", gulp.parallel(
    tsBuilder(configPath)
));

gulp.task("buildtest", gulp.parallel(
    tsBuilder(testPath)
));

gulp.task('mocha-test', function() {
    return gulp.src('./build/test/**/*.js') //take our transpiled test source
    .pipe(mocha({ui:'bdd'})) //runs tests
});

gulp.task("default", gulp.parallel(["server", "client", "launcher", "config"]));
gulp.task("test", gulp.series(["buildtest", "mocha-test"]));
