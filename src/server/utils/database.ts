/**
 * Defines Database file json structures, and also utility functions
 * for read/write operations on these files.
 *
 */
import fs = require("fs");
import Datastore = require("nedb");
import { promisify } from "util";

import { config } from "../../config";
import { createDummyData } from "../../dummy/initDummyData";
import { db } from "../model/elections";
import * as fileHandler from "./fileHandler";

const mkdirPromise = promisify(fs.mkdir);

/**
 * Checks whether the user data directory for the app
 * has been initialized. If not, then initializes it
 */
export async function checkDataDir() {
  const dirs = [config.database.dir, config.database.images];
  const files = [config.database.users];

  for (const dir of dirs) {
    if (!(fs.existsSync(dir))) {
      await mkdirPromise(dir);
    }
  }

  for (const file of files) {
    if (!(fs.existsSync(file))) {
      await fileHandler.writeFile(file, "{}");
    }
  }

  if (config.devMode && ((await db.getElections()).length === 0)) {
    await createDummyData();
  }
}

export function dbfind(datastore: Datastore, query: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    datastore.find(query)
      .sort({ createdAt: 1 })
      .exec((err: any, docs: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
  });
}

export function dbInsert<T>(datastore: Datastore, doc: T): Promise<T> {
  return new Promise((resolve, reject) => {
    datastore.insert(doc, (err: any, newDocs: T) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDocs);
      }
    });
  });
}

export function dbRemove(datastore: Datastore, query: any) {
  return new Promise((resolve, reject) => {
    datastore.remove(query, (err: any, numRemoved: number) => {
      if (err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
}

export function dbUpdate(
  datastore: Datastore,
  query: any,
  update: any,
  options: any) {
  return new Promise((resolve, reject) => {
    datastore.update(query, update, options, (err: any, numRemoved: number) => {
      if (err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
}
/**
 * Reads a json from its location, and returns
 * its contents as an object. If the datafile doesn't
 * exist, it calls checkDataDir, to initalize missing
 * files and returns an empty object {}.
 * @returns
 */
export async function getData(dataPath: string,
                              cryptKey?: Buffer): Promise<any> {
  let data;
  try {
    data = JSON.parse(await fileHandler.readFile(dataPath, cryptKey));
  } catch (error) {
    if (error.code === "ENOENT") {
      await checkDataDir();
      data = {};
    }
  }
  return data;
}
