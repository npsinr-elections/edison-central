import fs = require("fs");

import * as crypt from "./crypt";

export function readFile(dataPath: string,
                         cb: (data: object) => any,
                         cryptKey?: string) {
    fs.readFile(dataPath, "utf8", (err, data) => {
        if (err) {
            throw err;
        }

        if (cryptKey !== undefined) {
            data = crypt.decrypt(data, cryptKey);
        }

        cb(JSON.parse(data));
    });
}

export function writeFile(dataPath: string,
                          data: object,
                          cb: () => any,
                          cryptKey?: string) {
    let rawData: string = JSON.stringify(data);
    if (cryptKey !== undefined) {
        rawData = crypt.encrypt(rawData, cryptKey);
    }

    fs.writeFile(dataPath, rawData, "utf8", (err) => {
        if (err) {
            throw err;
        }
        cb();
    });
}
