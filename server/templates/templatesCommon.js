let rootPath = '../public/data/templates';

const defaultsPath = './templates/defaults';

const configurationFolder = "configuration";

let filesForTemplate = exports.filesForTemplate = { "settings": "template.json", "html": "template.html", "css": "template.scss", "code": "template.js" }

let getTemplatesFolderPath = exports.getTemplatesFolderPath = function() {
    return rootPath;
};

let getTemplatePath = exports.getTemplatePath = function getTemplatePath(templateName) {
    return getTemplatesFolderPath() + "/" + templateName;
};

let getConfigurationFolderPath = exports.getConfigurationFolderPath = function (templateName) {
    return getTemplatePath(templateName) + "/" + configurationFolder;
}

let getConfigurationFilePath = exports.getConfigurationFilePath = function (templateName, what) {
    return getConfigurationFolderPath(templateName) + "/" + what;
}

let getConfigurationDefaultFilePath = exports.getConfigurationDefaultFilePath = function (what) {
    return defaultsPath + "/" + what;
}