const glob = require("glob");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const tsSrcFolder = "./src/client/assets/scripts/";
const tsBuildFolder = "./build/client/assets/scripts/";
const tsGlob = tsSrcFolder + "*.ts";
const dev = "development";

function getEntries() {
    const entries = {};
    for(const path of glob.sync(tsGlob)) {
        const rootName = path.substring(
            path.lastIndexOf("/") + 1, path.lastIndexOf("."));

        entries[rootName] = path;
    }
    return entries;
}

module.exports = (env, argv) => ({
    watch: argv.mode === dev,
    entry: getEntries(),
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, argv.mode === dev ? tsSrcFolder : tsBuildFolder)
    },
    plugins: argv.mode === dev ? [] : [
        new UglifyJsPlugin({
            cache: true,
            parallel: true
        })
    ]
});
