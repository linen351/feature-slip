"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.del = exports.rename = exports.loadView = exports.key = void 0;
var common = require("../commonServer");
var viewsCommon = require("../viewer/viewsCommon.js");
var systemSettingsCommon = require("../systemSettings/systemSettingsCommon.js");
var viewsList = require("./viewsListServer.js");
var viewer = require("../viewer/viewerServer.js");
var fs = require("fs");
var that = this;
exports.key = "viewsEditor";
function getViewFieldsMould() {
    var systemSettings = systemSettingsCommon.getSystemSettings();
    return systemSettings.viewFieldsMould;
}
var loadView = function (viewName, viewFieldsMould) {
    viewFieldsMould = viewFieldsMould || getViewFieldsMould();
    var filePath = viewsCommon.getViewSettingsFilePath(viewName);
    var raw = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding))
        : {};
    return common.applyFieldDefaults(raw, viewFieldsMould);
};
exports.loadView = loadView;
var rename = function (inData) {
    var newViewName = inData.newViewName;
    if (!newViewName) {
        if (newViewName == "") {
            common.sendToAllClients.call(that, "warning", "Must give name");
        }
        return;
    }
    var oldPath = viewsCommon.getViewPath(inData.oldViewName), newPath = viewsCommon.getViewPath(newViewName);
    if (fs.existsSync(newPath)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }
    fs.renameSync(oldPath, newPath);
};
exports.rename = rename;
var del = function (inData) {
    var path = viewsCommon.getViewPath(inData.viewName);
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            fs.unlinkSync(path + "\\" + file);
        });
        fs.rmdirSync(path);
    }
};
exports.del = del;
exports.actions = {
    load: function (inData) {
        var viewName = inData.viewName;
        common.sendToAllClients.call(that, "loaded", {
            viewName: viewName,
            fields: (0, exports.loadView)(viewName)
        });
    },
    save: function (inData) {
        var viewName = inData.viewName;
        var filePath = viewsCommon.getViewSettingsFilePath(viewName);
        fs.writeFileSync(filePath, JSON.stringify(inData.fields), common.fileEncoding);
        exports.actions.load(inData);
        viewer.actions.loadViewSettings({ viewName: viewName });
    },
    rename: function (inData) {
        (0, exports.rename)(inData);
        viewsList.actions.getAll();
        exports.actions.load({ viewName: inData.newViewName });
    },
    "delete": function (inData) {
        (0, exports.del)(inData);
        viewsList.actions.getAll();
    }
};
var init = function () { };
exports.init = init;
