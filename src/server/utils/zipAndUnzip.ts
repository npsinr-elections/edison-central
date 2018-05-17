import * as zip from "adm-zip";

/**
 * Generates a zip file
 * createZip(FoldertoBeZipped, destination.zip);
 * @param toBeZipped The path of the folder to be zipped
 * @param destination The path where you want to create the zip file
 */
export function createZip(toBeZipped: string, destination: string): void {
  const zipper: zip = new zip();
  zipper.addLocalFolder(toBeZipped);
  zipper.writeZip(destination);
}

/**
 * Unpacks a zip file
 * unzip(FoldertoBeUnZipped.zip, destination);
 * @param toBeUnZipped The path of the folder to be unzipped
 * @param destination The path where you want to extract the zip file
 */
export function unzip(toBeUnZipped: string, destination: string): void {
  const zipper: zip = new zip(toBeUnZipped);
  zipper.extractAllTo(destination, true);
}
