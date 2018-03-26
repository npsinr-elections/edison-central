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
    HTML: ["src/client/**/*.html", "build/client"],
    CSS: ["src/client/**/*.css", "build/client"],
    TS: ["src/client/scripts", "build/client/scripts"]
};

const launcherPaths = ["src/main.ts", "build"];

function tsBuilder(paths) {
    return function builder(done) {
        gulp.src(paths[SRC])
            .pipe(ts.createProject("tsconfig.json")(ts.reporter.fullReporter))
            .pipe(gulp.dest(paths[DEST]));
        done();
    };
}

function mover(paths) {
    return function mover(done) {
        gulp.src(paths[SRC])
            .pipe(gulp.dest(paths[DEST]));
        done();
    };
}

function clientTsBuilders() {
    let entries = ["index.ts"];

    return gulp.parallel(
        entries.map((entry) => {
            return function tsBuilder (done) {
                console.log(`Building ${entry}`);
                browserify({
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
                    .pipe(gulp.dest("build/client/scripts"));

                done();
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
    mover(clientPaths.HTML)
));

gulp.task("launcher", gulp.parallel(
    tsBuilder(launcherPaths)
));

gulp.task("default", gulp.parallel(["server", "client", "launcher"]));
