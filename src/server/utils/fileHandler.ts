/**
 * Handles various fs tasks asynchronously in a thread-safe manner.
 */

import fs = require("fs");
import {promisify} from "util";

import * as crypt from "./crypt";

const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);

/**
 * Represents a job object stored by PathQueue
 *
 * @interface
 */
interface Job {
    task: Promise<any>;
    resolve: (value: any) => any;
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
     * @param {Promise<T>} task The fs task to push in the queue
     */
    public pushNewJob<T>(task: Promise<T>): Promise<T> {
        const self = this;
        return new Promise((resolve, reject) => {
            self.queue.push({task, resolve, reject});
            self.next();
        });
    }

    /**
     * Run the next job in the queue.
     */
    private async next() {
        if (this.taskRunning) {
            return false;
        }

        this.taskRunning = true;
        const currentJob: Job = this.queue.shift();
        try {
            const data: any = await currentJob.task;
            currentJob.resolve(data);
        } catch (error) {
            currentJob.reject(error);
        }

        this.taskRunning = false;
        this.next();
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
function newFileTask<T>(dataPath: string, task: Promise<T>): Promise<T> {
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
export async function readFile(dataPath: string,
                               cryptKey?: string): Promise<string> {
    let data: string = await newFileTask(dataPath,
                                        readFilePromise(dataPath, "utf8"));
    if (cryptKey !== undefined) {
        data = crypt.decrypt(data, cryptKey);
    }

    return data;
}

/**
 * A wrapper for fs.writeFile that supports data encryption,
 * and returns a promise
 * @param {string} dataPath Path to a file
 * @param {string} data Data to write to file
 * @param {string} cryptKey If provided,
 * data is encrypted with this key before writing
 * @returns {Promise<void>} Promise that resolves when file is written.
 */
export async function writeFile(dataPath: string,
                                data: string,
                                cryptKey?: string): Promise<void> {
    if (cryptKey !== undefined) {
        data = crypt.encrypt(data, cryptKey);
    }

    return await newFileTask(dataPath,
                             writeFilePromise(dataPath, data, "utf8"));
}
