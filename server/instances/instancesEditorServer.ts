import * as common from "../commonServer";
import * as templatesEditor from "../templates/templatesEditorServer";
import * as instancesCommon from "./instancesCommon";
import * as playerControl from "../player/playerControlServer";
import * as instancesList from "./instancesListServer";
import * as viewer from "../viewer/viewerServer";

import * as fs from "fs";

let that = this;

export const key = "instancesEditor";

function getInstanceFieldsMould(templateName) {
  let template = templatesEditor.loadTemplate(templateName);
  return (template.settings || {}).instanceFieldsMould;
}

export const loadInstance = function (
  templateName,
  instanceName,
  instanceFieldsMould?
) {
  instanceFieldsMould =
    instanceFieldsMould || getInstanceFieldsMould(templateName);

  let filePath = instancesCommon.getInstanceSettingsFilePath(
    templateName,
    instanceName
  );

  let raw = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding))
    : {};

  return common.applyFieldDefaults(raw, instanceFieldsMould);
};

export const loadInstancesWithContext = function (templateName, instanceNames) {
  let instanceFieldsMould = getInstanceFieldsMould(templateName);

  let result = instanceNames.map(function (instanceName) {
    return {
      instanceName: instanceName,
      fields: loadInstance(templateName, instanceName, instanceFieldsMould),
    };
  });

  return {
    templateName: templateName,
    instances: result,
  };
};

export const actions = {
  load: function (inData) {
    let templateName = inData.templateName,
      instanceNames = inData.instanceNames;

    if (!instanceNames) {
      instanceNames = instancesList.getAll(templateName);
    }

    common.sendToAllClients.call(
      that,
      "loaded",
      loadInstancesWithContext(templateName, instanceNames)
    );
  },

  save: function (inData) {
    let templateName = inData.templateName,
      instances = inData.instances;

    instances.forEach(function (instance) {
      let filePath = instancesCommon.getInstanceSettingsFilePath(
        templateName,
        instance.instanceName
      );

      fs.writeFileSync(
        filePath,
        JSON.stringify(instance.fields),
        common.fileEncoding
      );
    });

    actions.load(inData);
    playerControl.actions.loadAll();
  },

  add: function (inData) {
    instancesList.add(inData);

    delete inData.instanceName;

    actions.load(inData);
  },

  rename: function (inData) {
    instancesList.rename(inData);

    actions.load(inData);
  },

  delete: function (inData) {
    instancesList.del(inData);

    delete inData.instanceName;

    actions.load(inData);
  },

  startIn: function (inData) {
    viewer.startIn(inData);
  },

  startOut: function (inData) {
    viewer.startOut(inData);
  },
};

export const init = function () {};
