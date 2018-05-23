/**
 * Defines Database file json structures, and also utility functions
 * for read/write operations on these files.
 *
 */
import fs = require("fs");
import { promisify } from "util";

import { config } from "../../config";
import * as fileHandler from "./fileHandler";

const existsPromise = promisify(fs.exists);
const mkdirPromise = promisify(fs.mkdir);

/**
 * Structure for user password file
 */
export interface UserData {
  /** Encryption key encrypted itself, with the password */
  key: string;
  /** Hashed user password */
  password: string;
}

/**
 * Defines an election object
 */
export interface Election {
  [key: string]: string | Office[];
  id: string;
  name: string;
  caption: string;
  image: string;
  color: string;
  offices: Office[];
}

/**
 * Defines an office object
 */
export interface Office {
  [key: string]: string | Candidate[];
  id: string;
  name: string;
  caption: string;
  image: string;
  color: string;
  candidates: Candidate[];
}

/**
 * Defines a candidate object
 */
export interface Candidate {
  [key: string]: string | number;
  id: string;
  name: string;
  image: string;
  votes: number;
}

/**
 * Defines a result object
 */
export interface Result {
  election: Election;
  date: string;
}

/**
 * Defines structure of result json file
 */
export interface Results {
  results: Result[];
}

/**
 * Checks whether the user data directory for the app
 * has been initalized. If not, then initializes it
 */
export async function checkDataDir() {
  const dirs = [config.database.dir, config.database.images];
  for (const dir of dirs) {
    if (!(await existsPromise(dir))) {
      await mkdirPromise(dir);
    }
  }
  const files = [config.database.users, config.database.elections];
  for (const file of files) {
    if (!(await existsPromise(file))) {
      await fileHandler.writeFile(file, "{}");
    }
  }
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

/**
 * Reads users.json and returns its contents.
 * @returns {database.UserData}
 */
export async function getUserData(): Promise<UserData> {
  return await getData(config.database.users);
}

/**
 * Writes `data1 to users.json
 * @param data The data object as defined in `database.UserData`
 */
export async function writeUserData(data: UserData) {
  return await fileHandler.writeFile(config.database.users,
    JSON.stringify(data));
}
/**
 * Reads election data and returns a json object
 * @param  {Buffer} cryptKey Key used to encrypt data file
 * @returns Promise<Election>
 */
export async function getElectionData(cryptKey: Buffer): Promise<Election> {
  return await getData(config.database.elections, cryptKey);
}

/**
 * Writes election data
 * @param data Election object to write
 * @param cryptKey Key used to encrypt data file
 */
export async function writeElectionData(data: Election, cryptKey: Buffer) {
  return await fileHandler.writeFile(config.database.elections,
    JSON.stringify(data),
    cryptKey);
}
