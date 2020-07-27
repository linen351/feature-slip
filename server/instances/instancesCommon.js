let templatesCommon = require('../templates/templatesCommon.js');

const instancesFolder = "instances";

const instanceSettingsFileName = "instance.json";

let getInstancesFolderPath = exports.getInstancesFolderPath = function (templateName) {
    return templatesCommon.getTemplatePath(templateName) + "/" + instancesFolder;
}

let getInstancePath = exports.getInstancePath = function (templateName, instanceName) {
    return getInstancesFolderPath(templateName) + "/" + instanceName;
}

exports.getInstanceSettingsFilePath = function (templateName, instanceName) {
    return getInstancePath(templateName, instanceName) + "/" + instanceSettingsFileName;
}
