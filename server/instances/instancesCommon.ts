import * as templatesCommon from "../templates/templatesCommon";

const instancesFolder = "instances";

const instanceSettingsFileName = "instance.json";

export const getInstancesFolderPath = function (templateName) {
  return templatesCommon.getTemplatePath(templateName) + "/" + instancesFolder;
};

export const getInstancePath = function (templateName, instanceName) {
  return getInstancesFolderPath(templateName) + "/" + instanceName;
};

export const getInstanceSettingsFilePath = function (
  templateName,
  instanceName
) {
  return (
    getInstancePath(templateName, instanceName) + "/" + instanceSettingsFileName
  );
};
