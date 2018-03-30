import path = require("path");

export let config: {[index: string]: any} = {};

// Set project root as location of config file.
config.PROJECT_ROOT = __dirname;

config.port = process.env.PORT || 3000; // local server port

config.views = path.join(config.PROJECT_ROOT, "/client/views"); // html pages
 // static content
config.assets = path.join(config.PROJECT_ROOT, "/client/assets");

// Defining data storage location paths.
config.database = {};
// User Data directory
config.database.dir = path.join(config.PROJECT_ROOT, "/data");

// File for user
config.database.users = path.join(config.database.dir, "users.json");
