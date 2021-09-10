"use strict";
exports.__esModule = true;
exports.getSystemSettings = exports.systemSettingsPath = void 0;
var common = require("../commonServer");
var fs = require("fs");
exports.systemSettingsPath = "../public/data/systemSettings.json";
var getSystemSettings = function () {
    return JSON.parse(fs.readFileSync(exports.systemSettingsPath, common.fileEncoding));
};
exports.getSystemSettings = getSystemSettings;
