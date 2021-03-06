/**
 * Initializes the app's express server.
 */

import crypto = require("crypto");
import express = require("express");
import session = require("express-session");
import morgan = require("morgan");
import nunjucks = require("nunjucks");

import { router as externalRouter } from "./routes/externalRouter";
import { router as homeRouter } from "./routes/homeRouter";
import { router as mergeRouter } from "./routes/mergeRouter";
import { router as userRouter } from "./routes/userRouter";
import * as database from "./utils/database";

import { config } from "../config";

/**
 * Express middleware to check whether the user is in an authenticated
 * session or not. If not, then redirect to login
 * @param req
 * @param res
 * @param next
 */
function checkLoggedIn(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction) {
  if (req.session.user || process.env.NO_LOGIN) {
    next();
  } else {
    res.redirect("/users/login");
  }
}

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: crypto.randomBytes(64).toString("hex"),
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.set("views", config.static.views);

nunjucks.configure(app.get("views"), {
  autoescape: true,
  noCache: true,
  express: app
});

app.get("/identity", (_REQ, res) => {
  res.json({ name: config.appName });
});

app.use("/assets", express.static(config.static.assets));
app.use("/images", express.static(config.database.images));
app.use("/users", userRouter);
app.use("/external", externalRouter);

app.use("/", checkLoggedIn, homeRouter);
app.use("/", mergeRouter);

app.disable("view cache");

/**
 * Starts the app express server and calls `cb` after the server
 * has started.
 * @param cb Callback to call after server has started.
 */
export async function runServer(cb: () => void) {
  await database.checkDataDir();
  app.listen(config.port, cb);
}

// Only for testing!!
if (require.main === module) {
  runServer(() => { console.log("Listening on Port", config.port); });
}
