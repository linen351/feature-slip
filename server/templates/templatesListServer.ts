import * as common from "../commonServer";
import * as templatesCommon from "./templatesCommon";
import * as templatesEditor from "./templatesEditorServer";

import * as fs from "fs";

let that = this;

export const key = "templatesList";

export const getAll = function () {
  return fs.readdirSync(templatesCommon.getTemplatesFolderPath());
};

export const getAllActive = function () {
  return getAll().filter(function (templateName) {
    let settings = templatesEditor.loadTemplate(
      templateName,
      templatesCommon.filesForTemplate.settings
    );

    return settings.templateSettings.some((f) => f.name == "active" && f.value);
  });
};

export const actions = {
  getAll: function () {
    common.sendToAllClients.call(that, "all", getAll());
  },

  getAllActive: function () {
    common.sendToAllClients.call(that, "all", getAllActive());
  },

  add: function (inData) {
    let templateName = inData.templateName;

    if (!templateName) {
      common.sendToAllClients.call(that, "warning", "Must have name");
      return;
    }

    let path = templatesCommon.getTemplatePath(templateName);

    if (fs.existsSync(path)) {
      common.sendToAllClients.call(that, "warning", "Already exists");
      return;
    }

    fs.mkdirSync(path);

    actions.getAll();
  },
};

export const init = function () {};
