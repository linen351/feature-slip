import * as common from "../commonServer";
import * as systemSettingsCommon from "../systemSettings/systemSettingsCommon";
import * as templatesCommon from "./templatesCommon";
import * as viewerServer from "../viewer/viewerServer";
import * as templatesList from "./templatesListServer";
import * as instanceEditor from "../instances/instancesEditorServer";
import * as playerControl from "../player/playerControlServer";
import * as playlistsListServer from "../player/playlistsListServer";
import * as utilities from "../../public/utilities/utilities";

import * as fs from "fs";

let that = this;

export const key = "templatesEditor";

export const loadTemplate = function (templateName, what?) {
  if (what) {
    let isSettings = templatesCommon.filesForTemplate.settings == what;

    let filePath = templatesCommon.getConfigurationFilePath(templateName, what);

    if (!fs.existsSync(filePath)) {
      filePath = templatesCommon.getConfigurationDefaultFilePath(what);
    }

    let result = fs.readFileSync(filePath, common.fileEncoding);

    if (!isSettings) {
      return result;
    }

    const jsonResult = JSON.parse(result);

    let systemSettings = systemSettingsCommon.getSystemSettings();

    let templateFieldsMould = systemSettings.templateFieldsMould;

    jsonResult.templateSettings = common.applyFieldDefaults(
      jsonResult.templateSettings || {},
      templateFieldsMould
    );

    return jsonResult;
  } else {
    let result = {
        templateName: templateName,
      },
      filesForTemplate = templatesCommon.filesForTemplate;

    for (let what in filesForTemplate) {
      result[what] = loadTemplate(templateName, filesForTemplate[what]);
    }

    let systemSettings = systemSettingsCommon.getSystemSettings();

    result["viewFieldsMould"] = systemSettings.viewFieldsMould;
    result["systemSettings"] = systemSettings.constants;

    return result;
  }
};

export const actions = {
  load: function (inData) {
    let templateName = inData.templateName;

    common.sendToAllClients.call(that, "loaded", loadTemplate(templateName));

    if (inData.includeAllInstances) {
      instanceEditor.actions.load({ templateName: templateName });
    }
  },

  save: function (inData) {
    let data = inData.data;
    let what = inData.what;
    let templateName = inData.templateName;
    let templateConfigurationPath =
      templatesCommon.getConfigurationFolderPath(templateName);
    let filePath = templatesCommon.getConfigurationFilePath(
      templateName,
      templatesCommon.filesForTemplate[what]
    );

    if (!fs.existsSync(templateConfigurationPath)) {
      fs.mkdirSync(templateConfigurationPath);
    }

    if (
      templatesCommon.filesForTemplate[what] ==
      templatesCommon.filesForTemplate.settings
    ) {
      data.templateSettings = utilities.toDict(data.templateSettings);

      data = JSON.stringify(data);
    }

    fs.writeFileSync(filePath, data, common.fileEncoding);

    actions.load({ templateName: templateName, includeAllInstances: true });
    viewerServer.actions.loadTemplateForAllViews({
      templateName: templateName,
    });
    playerControl.actions.loadAll();
  },

  rename: function (inData) {
    let oldTemplateName = inData.oldTemplateName;
    let newTemplateName = inData.newTemplateName;

    if (!newTemplateName) {
      if (newTemplateName == "") {
        common.sendToAllClients.call(that, "warning", "Must give name");
      }
      return;
    }

    let oldPath = templatesCommon.getTemplatePath(oldTemplateName),
      newPath = templatesCommon.getTemplatePath(newTemplateName);

    if (fs.existsSync(newPath)) {
      common.sendToAllClients.call(that, "warning", "Already exists");
      return;
    }

    playlistsListServer.renameContents({
      template: {
        oldName: oldTemplateName,
        newName: newTemplateName,
      },
    });

    fs.renameSync(oldPath, newPath);

    playlistsListServer.actions.loadAll();
    templatesList.actions.getAll();
    actions.load({ templateName: newTemplateName, includeAllInstances: true });
    viewerServer.actions.loadTemplateForAllViews({
      templateName: newTemplateName,
    });
  },

  delete: function (inData) {
    let path = templatesCommon.getTemplatePath(inData.templateName);

    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file) => {
        fs.unlinkSync(path + "\\" + file);
      });

      fs.rmdirSync(path);
    }

    templatesList.actions.getAll();
  },
};

export const init = function () {};
