import crypto = require("crypto");
import express  = require("express");
import session= require("express-session");
import fs = require("fs");
import nunjucks = require("nunjucks");

import * as homeRouter from "./routes/homeRouter";
import * as usersRouter from "./routes/userRouter";

import {config} from "../config";

function checkLoggedIn(req: express.Request,
                       res: express.Response,
                       next: express.NextFunction) {
    // Check if the user has logged and the 'user' session variable is set.
    if (req.session.user) {
        next();
    } else {
        res.redirect("/users/login?redirect=true");
    }
}

const app = express();

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: crypto.randomBytes(64).toString("hex"),
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.set("views", config.views);

nunjucks.configure(app.get("views"), {
    autoescape: true,
    express: app
});

app.use("/assets", express.static(config.assets));

app.use("/users", usersRouter.router);

app.use("/", checkLoggedIn, homeRouter.router);

function checkDataDir() {
    if (!fs.existsSync(config.database.dir)) {
        fs.mkdirSync(config.database.dir);
    }

    if (!fs.existsSync(config.database.users)) {
        fs.writeFileSync(config.database.users, "{}", "utf8");
    }
}

export function runServer(cb: () => void): void {
    checkDataDir();
    app.listen(config.port, cb);
}

// Only for testing!!
if (require.main === module) {
    runServer(() => { console.log("Listening on Port", config.port); });
}
