/**
 * Handles various fs tasks asynchronously in a thread-safe manner.
 */

import fs = require("fs");
import {promisify} from "util";

import * as crypt from "./crypt";

import {config} from "../../config";

const existsPromise = promisify(fs.exists);
const mkdirPromise = promisify(fs.mkdir);
const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);

type promiseTask<T> = (...args: any[]) => Promise<T>;
/**
 * Represents a job object stored by PathQueue
 *
 * @interface
 */
interface Job {
    task: promiseTask<any>;
    args: any[];
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
    public pushNewJob<T>(task: promiseTask<T>,
                         args: any[]): Promise<T> {
        const self = this;
        return new Promise((resolve, reject) => {
            self.queue.push({task, args, resolve, reject});
            self.next();
        });
    }

    /**
     * Run the next job in the queue.
     */
    private async next() {
        if (this.queue.length === 0) {
            return;
        }

        if (this.taskRunning) {
            return;
        }

        this.taskRunning = true;
        const currentJob: Job = this.queue.shift();
        try {
            const data: any = await currentJob.task(...(currentJob.args));
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
function newFileTask<T>(dataPath: string,
                        task: promiseTask<T>,
                        ...args: any[]): Promise<T> {
    if (!(dataPath in queue)) {
        queue[dataPath] = new PathQueue();
    }
    return queue[dataPath].pushNewJob(task, args);
}

/**
 * A wrapper for fs.readFile to implement decryption and return a promise.
 * @param {string} dataPath Path to a file
 * @param {string} cryptKey If Provided, the data is decrypted with this key.
 * @returns {Promise<string>} Promise that resolves with data from file.
 */
export async function readFile(dataPath: string,
                               cryptKey?: Buffer): Promise<string> {
    let data: string = (await newFileTask(dataPath,
                                readFilePromise, dataPath, "utf8")) as string;
    if (cryptKey !== undefined) {
        data = crypt.decryptText(Buffer.from(data, "hex"), cryptKey)
                    .toString("utf8");
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
                                cryptKey?: Buffer): Promise<void> {
    if (cryptKey !== undefined) {
        data = (await crypt.encryptText(Buffer.from(data), cryptKey))
                            .toString("hex");
    }

    return await newFileTask(dataPath,
                             writeFilePromise, dataPath, data, "utf8");
}

export async function checkDataDir() {
    if (!(await existsPromise(config.database.dir))) {
        await mkdirPromise(config.database.dir);
    }

    if (!(await existsPromise(config.database.users))) {
        writeFile(config.database.users, "{}");
    }
}

export async function getUserData() {
    let data;
    try {
        data = JSON.parse(await readFile(
            config.database.users));
        } catch (error) {
            if (error.code === "ENOENT") {
                await checkDataDir();
                data = {};
            }
        }
    return data;
}
