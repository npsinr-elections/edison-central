import path = require("path");

interface Config {
  /** */
  PROJECT_ROOT: string;
  port: string | number;
  views: string;
  assets: string;
  database: DatabaseConfig;
}

interface DatabaseConfig {
  dir: string;
  users: string;
}

export let config: Config | any = {};

config.appName = "edison-central";
config.devMode = process.env.NODE_ENV === "development";

config.PROJECT_ROOT = __dirname;

config.port = process.env.PORT || 3000; // local server port

config.views = path.join(config.PROJECT_ROOT, "/client/views"); // html pages
// static content
config.assets = path.join(config.PROJECT_ROOT, "/client/assets");

// Defining data storage location paths.
config.database = {};
config.database.dir = path.join(process.env.APPDATA ||
  (process.platform === "darwin" ?
    path.join(process.env.HOME, "Library/Preferences") :
    process.env.HOME), ".edison");
config.database.images = path.join(config.database.dir, "images");
config.database.users = path.join(config.database.dir, "user.json");
config.database.elections = path.join(config.database.dir, "data.db");
