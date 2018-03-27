import express  = require("express");
import nunjucks = require("nunjucks");
import path = require("path");

import * as homeRoute from "./routes/homeRoute";

const app = express();

app.set("views", path.join(__dirname, "../client/views"));

nunjucks.configure(app.get("views"), {
    autoescape: true,
    express: app
});

app.set("port", process.env.PORT || 3000);

app.use("/assets", express.static(path.join(__dirname, "../client/assets")));
app.use("/", homeRoute.router);

export function main(cb: () => void): void {
    app.listen(app.get("port"), cb);
}

// Only for testing!!
if (require.main === module) {
    main(() => { console.log("Listening on Port", app.get("port")); });
}
