import * as common from "../commonServer";
import * as viewsCommon from "../viewer/viewsCommon";

import * as fs from "fs";

let that = this;

export const key = "viewsList";

export const getAll = function () {
  return fs.readdirSync(viewsCommon.getViewsFolderPath());
};

export const actions = {
  getAll: function () {
    common.sendToAllClients.call(that, "all", getAll());
  },

  add: function (inData) {
    let viewName = inData.viewName;

    if (!viewName) {
      common.sendToAllClients.call(that, "warning", "Must have name");
      return;
    }

    let folderPath = viewsCommon.getViewsFolderPath();

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    let path = viewsCommon.getViewPath(viewName);

    if (fs.existsSync(path)) {
      common.sendToAllClients.call(that, "warning", "Already exists");
      return;
    }

    fs.mkdirSync(path);

    actions.getAll();
  },
};

export const init = function () {};
