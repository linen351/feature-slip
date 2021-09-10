"use strict";
exports.__esModule = true;
exports.getInstanceSettingsFilePath = exports.getInstancePath = exports.getInstancesFolderPath = void 0;
var templatesCommon = require("../templates/templatesCommon");
var instancesFolder = "instances";
var instanceSettingsFileName = "instance.json";
var getInstancesFolderPath = function (templateName) {
    return templatesCommon.getTemplatePath(templateName) + "/" + instancesFolder;
};
exports.getInstancesFolderPath = getInstancesFolderPath;
var getInstancePath = function (templateName, instanceName) {
    return (0, exports.getInstancesFolderPath)(templateName) + "/" + instanceName;
};
exports.getInstancePath = getInstancePath;
var getInstanceSettingsFilePath = function (templateName, instanceName) {
    return ((0, exports.getInstancePath)(templateName, instanceName) + "/" + instanceSettingsFileName);
};
exports.getInstanceSettingsFilePath = getInstanceSettingsFilePath;
