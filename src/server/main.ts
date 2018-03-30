import crypto = require("crypto");
import express  = require("express");
import session= require("express-session");
import nunjucks = require("nunjucks");

import {config} from "../config";

import * as homeRouter from "./routes/homeRouter";
import * as usersRouter from "./routes/userRouter";

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

export function runServer(cb: () => void): void {
    app.listen(config.port, cb);
}

// Only for testing!!
if (require.main === module) {
    runServer(() => { console.log("Listening on Port", config.port); });
}
