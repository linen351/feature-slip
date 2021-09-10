"use strict";
exports.__esModule = true;
exports.getViewSettingsFilePath = exports.getViewPath = exports.getViewsFolderPath = void 0;
var rootPath = "../public/data/views";
var viewSettingsFileName = "view.json";
var getViewsFolderPath = function () {
    return rootPath;
};
exports.getViewsFolderPath = getViewsFolderPath;
var getViewPath = function getViewPath(viewName) {
    return (0, exports.getViewsFolderPath)() + "/" + viewName;
};
exports.getViewPath = getViewPath;
var getViewSettingsFilePath = function (viewName) {
    return (0, exports.getViewPath)(viewName) + "/" + viewSettingsFileName;
};
exports.getViewSettingsFilePath = getViewSettingsFilePath;
