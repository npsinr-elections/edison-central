import { config } from "../../config";
import * as fileHandler from "../utils/fileHandler";

import { getData } from "../utils/database";

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
