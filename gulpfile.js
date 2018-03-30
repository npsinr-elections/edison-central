const gulp = require("gulp"),
    ts = require("gulp-typescript"),
    uglify = require("gulp-uglify"),
    browserify = require("browserify"),
    tsify = require("tsify"),
    source = require("vinyl-source-stream"),
    rename = require("gulp-rename");

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
    JS: ["src/client/assets/scripts/*.js", "build/client/assets/scripts"],
    fonts: ["src/client/assets/fonts/*", "build/client/assets/fonts"],
    images: ["src/client/assets/images/*", "build/client/assets/images"],
    TS: ["src/client/assets/scripts", "build/client/assets/scripts"]
};

const launcherPath = ["src/main.ts", "build"];
const configPath = ["src/config.ts", "build"];

function tsBuilder(paths) {
    return function builder(done) {
        return gulp.src(paths[SRC])
            .pipe(ts.createProject("tsconfig.json")(ts.reporter.fullReporter))
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
    let entries = ["index.ts"];

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
                    .plugin(tsify)
                    .bundle()
                    .pipe(source(entry))
                    .pipe(rename({
                        extname: ".bundle.js"
                    }))
                    .pipe(gulp.dest("build/client/assets/scripts"));
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

gulp.task("default", gulp.parallel(["server", "client", "launcher", "config"]));
