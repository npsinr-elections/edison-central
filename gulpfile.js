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
    BootstrapCSS: ["node_modules/bootstrap/dist/css/bootstrap.min.css", "build/client/assets/styles"],
    BootstrapJS: ["node_modules/bootstrap/dist/js/bootstrap.min.js", "build/client/assets/scripts"],
    fonts: ["src/client/assets/fonts/*", "build/client/assets/fonts"],
    images: ["src/client/assets/images/*", "build/client/assets/images"],
    TS: ["src/client/assets/scripts", "build/client/assets/scripts"]
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
                    .pipe(gulp.dest("build/client/assets/scripts"));

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
    mover(clientPaths.HTML),
    mover(clientPaths.CSS),
    mover(clientPaths.fonts),
    mover(clientPaths.BootstrapCSS),
    mover(clientPaths.BootstrapJS)
));

gulp.task("launcher", gulp.parallel(
    tsBuilder(launcherPaths)
));

gulp.task("default", gulp.parallel(["server", "client", "launcher"]));
