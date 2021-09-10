"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.getAllActive = exports.getAll = exports.key = void 0;
var common = require("../commonServer");
var templatesCommon = require("./templatesCommon");
var templatesEditor = require("./templatesEditorServer");
var fs = require("fs");
var that = this;
exports.key = "templatesList";
var getAll = function () {
    return fs.readdirSync(templatesCommon.getTemplatesFolderPath());
};
exports.getAll = getAll;
var getAllActive = function () {
    return (0, exports.getAll)().filter(function (templateName) {
        var settings = templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.settings);
        return settings.templateSettings.some(function (f) { return f.name == "active" && f.value; });
    });
};
exports.getAllActive = getAllActive;
exports.actions = {
    getAll: function () {
        common.sendToAllClients.call(that, "all", (0, exports.getAll)());
    },
    getAllActive: function () {
        common.sendToAllClients.call(that, "all", (0, exports.getAllActive)());
    },
    add: function (inData) {
        var templateName = inData.templateName;
        if (!templateName) {
            common.sendToAllClients.call(that, "warning", "Must have name");
            return;
        }
        var path = templatesCommon.getTemplatePath(templateName);
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
