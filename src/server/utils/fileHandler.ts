import fs = require("fs");
import path = require("path");
import shortid = require("shortid");

import { config } from "../../config";
import * as crypt from "./crypt";

interface Job {
    task: Promise<string>;
    resolve: (dataPath: string) => any;
    reject: (reason?: any) => any;
}

interface Queue {
    [dataPath: string]: PathQueue;
}

class PathQueue {
    private queue: Job[];
    private taskRunning: boolean;

    constructor() {
        this.queue = [];
        this.taskRunning = false;
    }

    public pushNewJob(task: Promise<string>): Promise<string> {
        const self = this;
        return new Promise((resolve, reject) => {
            self.queue.push({task, resolve, reject});
            self.next();
        });
    }

    private next() {
        if (this.taskRunning) {
            return false;
        }

        this.taskRunning = true;
        const currentJob: Job = this.queue.shift();

        const self = this;
        currentJob.task.then(
            (data: string) => {
                currentJob.resolve(data);
                self.taskRunning = false;
                self.next();
            },
        (err) => {
            currentJob.reject(err);
            self.taskRunning = false;
            self.next();
        });
    }
}

const queue: Queue = {};

function newFileTask(dataPath: string, task: Promise<string>): Promise<string> {
    if (dataPath in queue) {
        return queue[dataPath].pushNewJob(task);
    } else {
        queue[dataPath] = new PathQueue();
    }
}

export function readFile(dataPath: string,
                         cryptKey?: string): Promise<string> {
    return newFileTask(dataPath,
        new Promise((resolve, reject) => {
            fs.readFile(dataPath, "utf8", (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (cryptKey !== undefined) {
                            data = crypt.decrypt(data, cryptKey);
                        }
                        resolve(data);
                    }
            });
        })
    );
}

export function writeFile(dataPath: string,
                          data: string,
                          cryptKey?: string): Promise<string> {
    if (cryptKey !== undefined) {
        data = crypt.encrypt(data, cryptKey);
    }
    return newFileTask(dataPath,
            new Promise((resolve, reject) => {
                fs.writeFile(dataPath, data, "utf8", (err) => {
                    if (err) {
                        reject(err);
                    } else {
                    resolve(dataPath);
                    }
                });
            })
    );
}
