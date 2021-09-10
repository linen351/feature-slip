"use strict";
exports.__esModule = true;
exports.getConfigurationDefaultFilePath = exports.getConfigurationFilePath = exports.getConfigurationFolderPath = exports.getTemplatePath = exports.getTemplatesFolderPath = exports.filesForTemplate = void 0;
var rootPath = "../public/data/templates";
var defaultsPath = "./templates/defaults";
var configurationFolder = "configuration";
exports.filesForTemplate = {
    settings: "template.json",
    html: "template.html",
    css: "template.scss",
    code: "template.js"
};
var getTemplatesFolderPath = function () {
    return rootPath;
};
exports.getTemplatesFolderPath = getTemplatesFolderPath;
var getTemplatePath = function getTemplatePath(templateName) {
    return (0, exports.getTemplatesFolderPath)() + "/" + templateName;
};
exports.getTemplatePath = getTemplatePath;
var getConfigurationFolderPath = function (templateName) {
    return (0, exports.getTemplatePath)(templateName) + "/" + configurationFolder;
};
exports.getConfigurationFolderPath = getConfigurationFolderPath;
var getConfigurationFilePath = function (templateName, what) {
    return (0, exports.getConfigurationFolderPath)(templateName) + "/" + what;
};
exports.getConfigurationFilePath = getConfigurationFilePath;
var getConfigurationDefaultFilePath = function (what) {
    return defaultsPath + "/" + what;
};
exports.getConfigurationDefaultFilePath = getConfigurationDefaultFilePath;
