"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.del = exports.add = exports.rename = exports.getAll = exports.key = void 0;
var common = require("../commonServer");
var instancesCommon = require("./instancesCommon");
var playlistsListServer = require("../player/playlistsListServer");
var fs = require("fs");
var that = this;
exports.key = "instancesList";
var getAll = function (templateName) {
    var path = instancesCommon.getInstancesFolderPath(templateName);
    if (!fs.existsSync(path)) {
        return [];
    }
    return fs.readdirSync(path);
};
exports.getAll = getAll;
var rename = function (inData) {
    var newInstanceName = inData.newInstanceName;
    var oldInstanceName = inData.oldInstanceName;
    if (!newInstanceName) {
        if (newInstanceName == "") {
            common.sendToAllClients.call(that, "warning", "No name");
        }
        return;
    }
    var templateName = inData.templateName, oldPath = instancesCommon.getInstancePath(templateName, oldInstanceName), newPath = instancesCommon.getInstancePath(templateName, newInstanceName);
    if (fs.existsSync(newPath)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }
    playlistsListServer.renameContents({
        template: {
            oldName: templateName
        },
        instance: {
            oldName: oldInstanceName,
            newName: newInstanceName
        }
    });
    fs.renameSync(oldPath, newPath);
    playlistsListServer.actions.loadAll();
};
exports.rename = rename;
var add = function (inData) {
    var templateName = inData.templateName, instanceName = inData.instanceName;
    if (!instanceName) {
        if (instanceName == "") {
            common.sendToAllClients.call(that, "warning", "Must give name");
        }
        return;
    }
    var instancesFolderPath = instancesCommon.getInstancesFolderPath(templateName);
    if (!fs.existsSync(instancesFolderPath)) {
        fs.mkdirSync(instancesFolderPath);
    }
    var path = instancesCommon.getInstancePath(templateName, instanceName);
    if (fs.existsSync(path)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }
    fs.mkdirSync(path);
};
exports.add = add;
var del = function (inData) {
    var path = instancesCommon.getInstancePath(inData.templateName, inData.instanceName);
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            fs.unlinkSync(path + "\\" + file);
        });
        fs.rmdirSync(path);
    }
};
exports.del = del;
exports.actions = {
    getAll: function (inData) {
        common.sendToAllClients.call(that, "all", (0, exports.getAll)(inData.templateName));
    },
    add: function (inData) {
        (0, exports.add)(inData);
        exports.actions.getAll(inData);
    },
    rename: function (inData) {
        (0, exports.rename)(inData);
        exports.actions.getAll(inData);
    },
    "delete": function (inData) {
        (0, exports.del)(inData);
        exports.actions.getAll(inData);
    }
};
var init = function () { };
exports.init = init;
