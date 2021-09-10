import * as common from "../commonServer";
import * as viewsCommon from "../viewer/viewsCommon.js";
import * as systemSettingsCommon from "../systemSettings/systemSettingsCommon.js";
import * as viewsList from "./viewsListServer.js";
import * as viewer from "../viewer/viewerServer.js";

import * as fs from "fs";

let that = this;

export const key = "viewsEditor";

function getViewFieldsMould() {
  let systemSettings = systemSettingsCommon.getSystemSettings();
  return systemSettings.viewFieldsMould;
}

export const loadView = function (viewName, viewFieldsMould?) {
  viewFieldsMould = viewFieldsMould || getViewFieldsMould();

  let filePath = viewsCommon.getViewSettingsFilePath(viewName);

  let raw = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding))
    : {};

  return common.applyFieldDefaults(raw, viewFieldsMould);
};

export const rename = function (inData) {
  let newViewName = inData.newViewName;

  if (!newViewName) {
    if (newViewName == "") {
      common.sendToAllClients.call(that, "warning", "Must give name");
    }
    return;
  }

  let oldPath = viewsCommon.getViewPath(inData.oldViewName),
    newPath = viewsCommon.getViewPath(newViewName);

  if (fs.existsSync(newPath)) {
    common.sendToAllClients.call(that, "warning", "Already exists");
    return;
  }

  fs.renameSync(oldPath, newPath);
};

export const del = function (inData) {
  let path = viewsCommon.getViewPath(inData.viewName);

  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      fs.unlinkSync(path + "\\" + file);
    });

    fs.rmdirSync(path);
  }
};

export const actions = {
  load: function (inData) {
    let viewName = inData.viewName;

    common.sendToAllClients.call(that, "loaded", {
      viewName: viewName,
      fields: loadView(viewName),
    });
  },

  save: function (inData) {
    let viewName = inData.viewName;

    let filePath = viewsCommon.getViewSettingsFilePath(viewName);

    fs.writeFileSync(
      filePath,
      JSON.stringify(inData.fields),
      common.fileEncoding
    );

    actions.load(inData);

    viewer.actions.loadViewSettings({ viewName: viewName });
  },

  rename: function (inData) {
    rename(inData);

    viewsList.actions.getAll();

    actions.load({ viewName: inData.newViewName });
  },

  delete: function (inData) {
    del(inData);

    viewsList.actions.getAll();
  },
};

export const init = function () {};
