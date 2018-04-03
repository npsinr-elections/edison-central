/**
 * Handles various fs tasks asynchronously in a thread-safe manner.
 */

import fs = require("fs");
import * as crypt from "./crypt";

/**
 * Represents a job object stored by PathQueue
 *
 * @interface
 */
interface Job {
    task: Promise<string>;
    resolve: (dataPath: string) => any;
    reject: (reason?: any) => any;
}

/**
 * Represents a object which maps paths to their queue of tasks.
 *
 * @interface
 */
interface Queue {
    [dataPath: string]: PathQueue;
}

/**
 * Implements a Queue to store fs tasks for a path.
 *
 * @class
 */
class PathQueue {
    private queue: Job[];
    private taskRunning: boolean;

    /**
     * Initalize a new PathQueue
     *
     * @constructor
     */
    constructor() {
        this.queue = [];
        this.taskRunning = false;
    }

    /**
     * Push a new job into the queue
     * @param {Promise<string>} task The fs task to push in the queue
     */
    public pushNewJob(task: Promise<string>): Promise<string> {
        const self = this;
        return new Promise((resolve, reject) => {
            self.queue.push({task, resolve, reject});
            self.next();
        });
    }

    /**
     * Run the next job in the queue.
     */
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

/**
 * Queue to handle tasks for fileHandler module.
 */
const queue: Queue = {};

/**
 * Function to add a new fs task to its path queue
 * @param {string} dataPath The Path which the task operates on
 * @param {Promise<string>} task The new fs task to run
 * @returns {Promise<string>} A promise which resolves when the job completes.
 */
function newFileTask(dataPath: string, task: Promise<string>): Promise<string> {
    if (!(dataPath in queue)) {
        queue[dataPath] = new PathQueue();
    }
    return queue[dataPath].pushNewJob(task);
}

/**
 * A wrapper for fs.readFile to implement decryption and return a promise.
 * @param {string} dataPath Path to a file
 * @param {string} cryptKey If Provided, the data is decrypted with this key.
 * @returns {Promise<string>} Promise that resolves with data from file.
 */
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

/**
 * A wrapper for fs.writeFile that supports data encryption,
 * and returns a promise
 * @param {string} dataPath Path to a file
 * @param {string} data Data to write to file
 * @param {string} cryptKey If provided,
 * data is encrypted with this key before writing
 * @returns {Promise<string>} Promise that resolves with filePath.
 */
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
