import * as common from "../commonServer";

import * as fs from "fs";

export const systemSettingsPath = "../public/data/systemSettings.json";

export const getSystemSettings = function () {
  return JSON.parse(fs.readFileSync(systemSettingsPath, common.fileEncoding));
};
