"use strict";
exports.__esModule = true;
exports.applyFieldDefaults = exports.fileEndingIsJson = exports.sendToAllClients = exports.fileEncoding = void 0;
var app_1 = require("./app");
exports.fileEncoding = "utf-8";
var sendToAllClients = function (action, data) {
    (0, app_1.sendToAllClients)(this, { action: action, data: data });
};
exports.sendToAllClients = sendToAllClients;
var fileEndingIsJson = function (path) {
    return path.substring(path.lastIndexOf(".") + 1) == "json";
};
exports.fileEndingIsJson = fileEndingIsJson;
var applyFieldDefaults = function (settings, defaultFields) {
    return defaultFields.map(function (variable) {
        var name = variable.name, type = variable.type, defValue = variable.value;
        var value = settings[name];
        if (value === undefined) {
            value = defValue;
        }
        return {
            name: name,
            value: value,
            type: type
        };
    });
};
exports.applyFieldDefaults = applyFieldDefaults;
