/**
 * Launches the application by starting up the server
 * and optionally opening a browser window with the app.
 */
import opn = require("opn");

import { config } from "./config";
import { runServer } from "./server/main";

/**
 * Runs after server as started. If the app is not in
 * development mode, then also opens a browser window
 * with the app's root page.
 */
function callBack() {
  // Runs after server has started
  console.log("Listening on Port", config.port);

  // App is in production mode by default
  if (!config.devMode) {
    opn("http://localhost:" + config.port);
  }
}

runServer(callBack);
