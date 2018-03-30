import opn = require("opn");

import {config} from "./config";
import {runServer} from "./server/main";

function callBack() {
    // Runs after server has started
    console.log("Listening on Port", config.port);

    if (process.env.NODE_ENV === "production") {
        opn("http://localhost:" + config.port);
    }
}

runServer(callBack);
