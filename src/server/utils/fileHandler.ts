/**
 * Handles various fs tasks asynchronously in a thread-safe manner.
 */

import { readFile as fsReadFile, writeFile as fsWriteFile } from "fs";
import { promisify } from "util";
import * as crypt from "./crypt";

const readFilePromise = promisify(fsReadFile);
const writeFilePromise = promisify(fsWriteFile);

/**
 * Represents an arbitrary async fs function modified to return
 * a promise using `utils.promisify`
 */
type promiseTask<T> = (...args: any[]) => Promise<T>;

/**
 * Represents a job object stored by PathQueue
 *
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
 */
interface Queue {
  [dataPath: string]: PathQueue;
}

/**
 * Implements a Queue to store fs tasks for a path.
 * This class ensures that for a given path ONLY ONE job
 * is allowed to run at an instant of time. This is important
 * because multiple threads accessing/modifying the same file
 * can lead to corrupted data.
 * @class
 */
class PathQueue {
  /** Queue of jobs */
  private queue: Job[];
  /** Tells whether a job is currently running */
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
   * @param task The fs task to push in the queue
   * @returns A promise that resolves when the queued
   * task has completed
   */
  public pushNewJob<T>(task: promiseTask<T>,
                       args: any[]): Promise<T> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.queue.push({ task, args, resolve, reject });
      self.next();
    });
  }

  /**
   * Run the next job in the queue, making sure only one
   * job is running at a given time.
   */
  private async next() {
    // Check whether the queue has no jobs
    if (this.queue.length === 0) {
      return;
    }

    // Ensure that only one task can be run at a time
    if (this.taskRunning) {
      return;
    }

    // If no other task is running and the queue is not empty,
    // dequeue and run a task.
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
 * @param dataPath The Path which the task operates on
 * @param task The new fs task to run
 * @returns A promise which resolves when the job completes.
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
 * @param dataPath Path to a file
 * @param cryptKey If Provided, the data is decrypted with this key.
 * @returns Promise that resolves with data from file.
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
 * @param dataPath Path to a file
 * @param data Data to write to file
 * @param cryptKey If provided,
 * data is encrypted with this key before writing
 * @returns Promise that resolves when file is written.
 */
export async function writeFile(dataPath: string,
                                data: string,
                                cryptKey?: Buffer): Promise<any> {
  if (cryptKey !== undefined) {
    data = (await crypt.encryptText(Buffer.from(data), cryptKey))
      .toString("hex");
  }

  return await newFileTask(dataPath,
    writeFilePromise, dataPath, data, "utf8");
}
