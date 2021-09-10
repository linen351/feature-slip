"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.loadInstancesWithContext = exports.loadInstance = exports.key = void 0;
var common = require("../commonServer");
var templatesEditor = require("../templates/templatesEditorServer");
var instancesCommon = require("./instancesCommon");
var playerControl = require("../player/playerControlServer");
var instancesList = require("./instancesListServer");
var viewer = require("../viewer/viewerServer");
var fs = require("fs");
var that = this;
exports.key = "instancesEditor";
function getInstanceFieldsMould(templateName) {
    var template = templatesEditor.loadTemplate(templateName);
    return (template.settings || {}).instanceFieldsMould;
}
var loadInstance = function (templateName, instanceName, instanceFieldsMould) {
    instanceFieldsMould =
        instanceFieldsMould || getInstanceFieldsMould(templateName);
    var filePath = instancesCommon.getInstanceSettingsFilePath(templateName, instanceName);
    var raw = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding))
        : {};
    return common.applyFieldDefaults(raw, instanceFieldsMould);
};
exports.loadInstance = loadInstance;
var loadInstancesWithContext = function (templateName, instanceNames) {
    var instanceFieldsMould = getInstanceFieldsMould(templateName);
    var result = instanceNames.map(function (instanceName) {
        return {
            instanceName: instanceName,
            fields: (0, exports.loadInstance)(templateName, instanceName, instanceFieldsMould)
        };
    });
    return {
        templateName: templateName,
        instances: result
    };
};
exports.loadInstancesWithContext = loadInstancesWithContext;
exports.actions = {
    load: function (inData) {
        var templateName = inData.templateName, instanceNames = inData.instanceNames;
        if (!instanceNames) {
            instanceNames = instancesList.getAll(templateName);
        }
        common.sendToAllClients.call(that, "loaded", (0, exports.loadInstancesWithContext)(templateName, instanceNames));
    },
    save: function (inData) {
        var templateName = inData.templateName, instances = inData.instances;
        instances.forEach(function (instance) {
            var filePath = instancesCommon.getInstanceSettingsFilePath(templateName, instance.instanceName);
            fs.writeFileSync(filePath, JSON.stringify(instance.fields), common.fileEncoding);
        });
        exports.actions.load(inData);
        playerControl.actions.loadAll();
    },
    add: function (inData) {
        instancesList.add(inData);
        delete inData.instanceName;
        exports.actions.load(inData);
    },
    rename: function (inData) {
        instancesList.rename(inData);
        exports.actions.load(inData);
    },
    "delete": function (inData) {
        instancesList.del(inData);
        delete inData.instanceName;
        exports.actions.load(inData);
    },
    startIn: function (inData) {
        viewer.startIn(inData);
    },
    startOut: function (inData) {
        viewer.startOut(inData);
    }
};
var init = function () { };
exports.init = init;
