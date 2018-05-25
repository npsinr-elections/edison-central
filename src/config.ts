import path = require("path");

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
  }>;
}

const APPDATA = path.join(
  process.env.APPDATA
  || (
    process.platform === "darwin" ?
    path.join(process.env.HOME, "Library/Preferences") :
    process.env.HOME), ".edison"
  );

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
    mergeDB: path.join(APPDATA, "merges", "merge.db")
  }
};
