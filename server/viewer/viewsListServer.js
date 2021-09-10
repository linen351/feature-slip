"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.getAll = exports.key = void 0;
var common = require("../commonServer");
var viewsCommon = require("../viewer/viewsCommon");
var fs = require("fs");
var that = this;
exports.key = "viewsList";
var getAll = function () {
    return fs.readdirSync(viewsCommon.getViewsFolderPath());
};
exports.getAll = getAll;
exports.actions = {
    getAll: function () {
        common.sendToAllClients.call(that, "all", (0, exports.getAll)());
    },
    add: function (inData) {
        var viewName = inData.viewName;
        if (!viewName) {
            common.sendToAllClients.call(that, "warning", "Must have name");
            return;
        }
        var folderPath = viewsCommon.getViewsFolderPath();
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        var path = viewsCommon.getViewPath(viewName);
        if (fs.existsSync(path)) {
            common.sendToAllClients.call(that, "warning", "Already exists");
            return;
        }
        fs.mkdirSync(path);
        exports.actions.getAll();
    }
};
var init = function () { };
exports.init = init;
