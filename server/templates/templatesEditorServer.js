"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.loadTemplate = exports.key = void 0;
var common = require("../commonServer");
var systemSettingsCommon = require("../systemSettings/systemSettingsCommon");
var templatesCommon = require("./templatesCommon");
var viewerServer = require("../viewer/viewerServer");
var templatesList = require("./templatesListServer");
var instanceEditor = require("../instances/instancesEditorServer");
var playerControl = require("../player/playerControlServer");
var playlistsListServer = require("../player/playlistsListServer");
var utilities = require("../../public/utilities/utilities");
var fs = require("fs");
var that = this;
exports.key = "templatesEditor";
var loadTemplate = function (templateName, what) {
    if (what) {
        var isSettings = templatesCommon.filesForTemplate.settings == what;
        var filePath = templatesCommon.getConfigurationFilePath(templateName, what);
        if (!fs.existsSync(filePath)) {
            filePath = templatesCommon.getConfigurationDefaultFilePath(what);
        }
        var result = fs.readFileSync(filePath, common.fileEncoding);
        if (!isSettings) {
            return result;
        }
        var jsonResult = JSON.parse(result);
        var systemSettings = systemSettingsCommon.getSystemSettings();
        var templateFieldsMould = systemSettings.templateFieldsMould;
        jsonResult.templateSettings = common.applyFieldDefaults(jsonResult.templateSettings || {}, templateFieldsMould);
        return jsonResult;
    }
    else {
        var result = {
            templateName: templateName
        }, filesForTemplate = templatesCommon.filesForTemplate;
        for (var what_1 in filesForTemplate) {
            result[what_1] = (0, exports.loadTemplate)(templateName, filesForTemplate[what_1]);
        }
        var systemSettings = systemSettingsCommon.getSystemSettings();
        result["viewFieldsMould"] = systemSettings.viewFieldsMould;
        result["systemSettings"] = systemSettings.constants;
        return result;
    }
};
exports.loadTemplate = loadTemplate;
exports.actions = {
    load: function (inData) {
        var templateName = inData.templateName;
        common.sendToAllClients.call(that, "loaded", (0, exports.loadTemplate)(templateName));
        if (inData.includeAllInstances) {
            instanceEditor.actions.load({ templateName: templateName });
        }
    },
    save: function (inData) {
        var data = inData.data;
        var what = inData.what;
        var templateName = inData.templateName;
        var templateConfigurationPath = templatesCommon.getConfigurationFolderPath(templateName);
        var filePath = templatesCommon.getConfigurationFilePath(templateName, templatesCommon.filesForTemplate[what]);
        if (!fs.existsSync(templateConfigurationPath)) {
            fs.mkdirSync(templateConfigurationPath);
        }
        if (templatesCommon.filesForTemplate[what] ==
            templatesCommon.filesForTemplate.settings) {
            data.templateSettings = utilities.toDict(data.templateSettings);
            data = JSON.stringify(data);
        }
        fs.writeFileSync(filePath, data, common.fileEncoding);
        exports.actions.load({ templateName: templateName, includeAllInstances: true });
        viewerServer.actions.loadTemplateForAllViews({
            templateName: templateName
        });
        playerControl.actions.loadAll();
    },
    rename: function (inData) {
        var oldTemplateName = inData.oldTemplateName;
        var newTemplateName = inData.newTemplateName;
        if (!newTemplateName) {
            if (newTemplateName == "") {
                common.sendToAllClients.call(that, "warning", "Must give name");
            }
            return;
        }
        var oldPath = templatesCommon.getTemplatePath(oldTemplateName), newPath = templatesCommon.getTemplatePath(newTemplateName);
        if (fs.existsSync(newPath)) {
            common.sendToAllClients.call(that, "warning", "Already exists");
            return;
        }
        playlistsListServer.renameContents({
            template: {
                oldName: oldTemplateName,
                newName: newTemplateName
            }
        });
        fs.renameSync(oldPath, newPath);
        playlistsListServer.actions.loadAll();
        templatesList.actions.getAll();
        exports.actions.load({ templateName: newTemplateName, includeAllInstances: true });
        viewerServer.actions.loadTemplateForAllViews({
            templateName: newTemplateName
        });
    },
    "delete": function (inData) {
        var path = templatesCommon.getTemplatePath(inData.templateName);
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file) {
                fs.unlinkSync(path + "\\" + file);
            });
            fs.rmdirSync(path);
        }
        templatesList.actions.getAll();
    }
};
var init = function () { };
exports.init = init;
