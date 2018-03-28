import crypto = require("crypto");
import express  = require("express");
import session= require("express-session");
import nunjucks = require("nunjucks");
import path = require("path");

import * as homeRouter from "./routes/homeRouter";
import * as usersRouter from "./routes/userRouter";

function checkLoggedIn(req: express.Request,
                       res: express.Response,
                       next: express.NextFunction) {
    // Check if the user has logged in the 'user' session variable is set.
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

app.set("views", path.join(__dirname, "../client/views"));

nunjucks.configure(app.get("views"), {
    autoescape: true,
    express: app
});

app.set("port", process.env.PORT || 3000);

app.use("/assets", express.static(path.join(__dirname, "../client/assets")));

app.use("/users", usersRouter.router);

app.use("/", checkLoggedIn, homeRouter.router);

export function main(cb: () => void): void {
    app.listen(app.get("port"), cb);
}

// Only for testing!!
if (require.main === module) {
    main(() => { console.log("Listening on Port", app.get("port")); });
}
