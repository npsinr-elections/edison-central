import { writeFile } from "fs";
import { extname } from "path";

import * as zip from "adm-zip";

import { config } from "../../config";

/**
 * Generates a zip file
 * @param toBeZipped The path of the folder to be zipped
 * @param destination The path where you want to create the zip file
 */
export function zipElection(
  dbFile: string,
  imagesDir: string,
  destination: string): void {
  const zipper: zip = new zip();
  zipper.addLocalFile(dbFile);
  zipper.addLocalFile(config.database.users);
  zipper.addLocalFolder(imagesDir, "images");
  zipper.writeZip(destination);
}

/**
 * Unpacks a zip file
 * @param toBeUnZipped The path of the folder to be unzipped
 * @param destination The path where you want to extract the zip file
 */
export function unzip(
  toBeUnZipped: string,
  destination: string): Promise<void> {

  return new Promise((resolve, reject) => {
    const zipper: zip = new zip(toBeUnZipped);
    zipper.extractAllToAsync(destination, true, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Extracts the zip file (containing a single file) to
 * the file to given by `destPath` with the original file
 * extension
 * @param zipPath The .zip of a single file
 * @param dest The destination of the extracted file
 */
export function extractZipFile(
  zipPath: string,
  dest: string): Promise<void> {

  const entry = (new zip(zipPath)).getEntries()[0];
  const filePath = dest + extname(entry.name);

  return new Promise((resolve, reject) => {
    entry.getDataAsync((buf) => {
      writeFile(filePath, buf, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}
