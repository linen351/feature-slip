import * as common from "../commonServer";

import * as fs from "fs";

let rootPath = "../public/data/views";

const viewSettingsFileName = "view.json";

export const getViewsFolderPath = function () {
  return rootPath;
};

export const getViewPath = function getViewPath(viewName) {
  return getViewsFolderPath() + "/" + viewName;
};

export const getViewSettingsFilePath = function (viewName) {
  return getViewPath(viewName) + "/" + viewSettingsFileName;
};
