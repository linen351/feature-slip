const rootPath = "../public/data/templates";

const defaultsPath = "./templates/defaults";

const configurationFolder = "configuration";

export const filesForTemplate = {
  settings: "template.json",
  html: "template.html",
  css: "template.scss",
  code: "template.js",
};

export const getTemplatesFolderPath = function () {
  return rootPath;
};

export const getTemplatePath = function getTemplatePath(templateName) {
  return getTemplatesFolderPath() + "/" + templateName;
};

export const getConfigurationFolderPath = function (templateName) {
  return getTemplatePath(templateName) + "/" + configurationFolder;
};

export const getConfigurationFilePath = function (templateName, what) {
  return getConfigurationFolderPath(templateName) + "/" + what;
};

export const getConfigurationDefaultFilePath = function (what) {
  return defaultsPath + "/" + what;
};
