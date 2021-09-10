"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.startOut = exports.startIn = exports.key = void 0;
var common = require("../commonServer");
var systemSettingsCommon = require("../systemSettings/systemSettingsCommon");
var templatesCommon = require("../templates/templatesCommon");
var templatesEditor = require("../templates/templatesEditorServer");
var templatesList = require("../templates/templatesListServer");
var instancesEditor = require("../instances/instancesEditorServer");
var viewsEditor = require("../viewer/viewsEditorServer");
var viewsList = require("../viewer/viewsListServer");
var that = this;
exports.key = "viewer";
var startIn = function (inData) {
    var templateName = inData.templateName, instanceName = inData.instanceName;
    inData.instanceSettings = getAllInstanceSettings(templateName, instanceName);
    common.sendToAllClients.call(that, "startIn", inData);
};
exports.startIn = startIn;
var startOut = function (inData) {
    var templateName = inData.templateName, instanceName = inData.instanceName;
    common.sendToAllClients.call(that, "startOut", inData);
};
exports.startOut = startOut;
exports.actions = {
    loadSystemSettings: function () {
        common.sendToAllClients.call(that, "loaded", {
            systemSettings: getAllSystemSettings()
        });
    },
    loadAllViewsSettings: function () {
        viewsList.getAll().forEach(function (viewName) {
            exports.actions.loadViewSettings({ viewName: viewName });
        });
    },
    loadViewSettings: function (inData) {
        var viewName = inData.viewName;
        common.sendToAllClients.call(that, "loaded", {
            viewName: viewName,
            viewSettings: getAllViewSettings(viewName)
        });
    },
    loadAllTemplatesForView: function (inData) {
        var viewName = inData.viewName;
        templatesList.getAll().forEach(function (templateName) {
            exports.actions.loadTemplateForView({
                viewName: viewName,
                templateName: templateName
            });
        });
    },
    loadTemplateForView: function (inData) {
        var viewName = inData.viewName, templateName = inData.templateName;
        common.sendToAllClients.call(that, "loaded", {
            viewName: viewName,
            template: {
                templateName: templateName,
                code: loadTemplateCodeCompiled(viewName, templateName),
                css: loadTemplateCss(viewName, templateName),
                html: loadTemplateHtml(viewName, templateName),
                settings: getAllTemplateSettings(templateName)
            }
        });
    },
    loadTemplateForAllViews: function (inData) {
        var templateName = inData.templateName;
        viewsList.getAll().forEach(function (viewName) {
            exports.actions.loadTemplateForView({
                viewName: viewName,
                templateName: templateName
            });
        });
    },
    loadAllTemplatesForAllViews: function () {
        viewsList.getAll().forEach(function (viewName) {
            exports.actions.loadAllTemplatesForView({
                viewName: viewName
            });
        });
    }
};
var init = function () { };
exports.init = init;
function getAllSystemSettings() {
    return systemSettingsCommon.getSystemSettings().constants;
}
function getAllTemplateSettings(templateName) {
    return templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.settings);
}
function getAllInstanceSettings(templateName, instanceName) {
    return instancesEditor.loadInstance(templateName, instanceName);
}
function getAllViewSettings(viewName) {
    return viewsEditor.loadView(viewName);
}
function getAllApplicableFieldsForViewAndTemplate(viewName, templateName) {
    var systemSettings = getAllSystemSettings();
    var viewSettings = getAllViewSettings(viewName);
    var templateSettings = getAllTemplateSettings(templateName);
    return {
        system: systemSettings,
        view: viewSettings,
        template: templateSettings
    };
}
function loadTemplateCss(viewName, templateName) {
    return templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.css);
}
var requiredFuncNames = ["init", "startIn", "startOut"];
function loadTemplateCodeCompiled(viewName, templateName) {
    var code = templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.code);
    var wrapp = "";
    wrapp += "  let htmlTemplate;\n";
    wrapp += "  let cssTemplate;\n";
    wrapp += "  return {\n";
    wrapp +=
        "      instantiate: function(allSettingsData, templateName, instanceName) {\n";
    wrapp += "          let $instanceRoot;\n";
    wrapp += "          let $templateRoot;\n";
    wrapp += "          let $css;\n";
    wrapp += "          let instanceMode = 0;\n";
    wrapp += "          const template = allSettingsData.template;\n";
    wrapp += "          const view = allSettingsData.view;\n";
    wrapp += "          const system = allSettingsData.system;\n";
    wrapp += code + "\n";
    wrapp += "          return {\n";
    wrapp +=
        "              getTemplateName: function () { return templateName; },\n";
    wrapp +=
        "              getInstanceName: function () { return instanceName; },\n";
    wrapp +=
        "              set$InstanceDom: function ($d) { $instanceRoot = $d; },\n";
    wrapp +=
        "              set$TemplateDom: function ($d) { $templateRoot = $d; },\n";
    wrapp +=
        "              get$InstanceDom: function () { return $instanceRoot; },\n";
    wrapp += "              set$Css: function ($c) { $css = $c; },\n";
    wrapp += "              get$Css: function () { return $css; },\n";
    wrapp +=
        "              setMode: function (m) {  if (instanceMode != (m - 1)) { throw 'Stepping up error'; }\n";
    wrapp += "                instanceMode = m;\n";
    wrapp += "              },\n";
    wrapp += "              getMode: function () { return instanceMode; },\n";
    wrapp += requiredFuncNames
        .map(function (funcName) {
        return funcName + ":" + funcName;
    })
        .join(",\n");
    wrapp += "        };\n";
    wrapp += "      }\n";
    wrapp += "  };\n";
    return wrapp;
}
function loadTemplateHtml(viewName, templateName) {
    return templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.html);
}
