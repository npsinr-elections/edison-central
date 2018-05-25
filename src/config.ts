import path = require("path");

/**
 * Folder in which the app stores it's data
 *
 * Windows: %APPDATA%
 * Linux: $HOME
 * Mac: "Library/Preferences"
 */
const APPDATA = path.join(
  process.env.APPDATA
  || (
    process.platform === "darwin" ?
      path.join(process.env.HOME, "Library/Preferences") :
      process.env.HOME), ".edison"
);

interface Config {
  /** */
  appName: string;
  devMode: boolean;
  port: string;
  static: Readonly<{
    views: string;
    assets: string;
  }>;
  database: Readonly<{
    dir: string;
    users: string;
    images: string;
    merges: string;
    mergeDB: string;
    elections: string;
    exportTemp: string;
  }>;
}

export const config: Readonly<Config> = {
  appName: "edison-central",
  devMode: process.env.NODE_ENV === "development",
  port: process.env.PORT || "3000",
  static: {
    views: path.join(__dirname, "client", "views"),
    assets: path.join(__dirname, "client", "assets"),
  },
  database: {
    dir: APPDATA,
    images: path.join(APPDATA, "images"),
    users: path.join(APPDATA, "user.json"),
    elections: path.join(APPDATA, "data.db"),
    merges: path.join(APPDATA, "merges"),
    mergeDB: path.join(APPDATA, "merges", "merge.db"),
    exportTemp: path.join(APPDATA, "merges", "export-temp")
  }
};
