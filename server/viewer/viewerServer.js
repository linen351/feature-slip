let common = require('../commonServer.js');

let systemSettingsCommon = require('../systemSettings/systemSettingsCommon.js');
let templatesCommon = require('../templates/templatesCommon.js');
let templatesEditor = require('../templates/templatesEditorServer.js');
let templatesList = require('../templates/templatesListServer.js');
let instancesEditor = require('../instances/instancesEditorServer.js');
let instancesList = require('../instances/instancesListServer.js');
let viewsEditor = require('../viewer/viewsEditorServer.js');
let viewsList = require('../viewer/viewsListServer.js');
let utilities = require('../../public/utilities/utilities.js');

let that = this;

let Handlebars = require('../../public/thirdparty/handlebars-v4.0.11.js');

exports.key = "viewer";

exports.startIn = function (inData) {

    let templateName = inData.templateName,
        instanceName = inData.instanceName;

    inData.instanceSettings = getAllInstanceSettings(templateName, instanceName);

    common.sendToAllClients.call(that, "startIn", inData);

};

exports.startOut = function (inData) {

    let templateName = inData.templateName,
        instanceName = inData.instanceName;

    common.sendToAllClients.call(that, "startOut", inData);

};

let actions = exports.actions = {

    loadSystemSettings: function () {

        common.sendToAllClients.call(that, "loaded", {
            systemSettings: getAllSystemSettings()
        });

    },

    loadAllViewsSettings: function () {

        viewsList.getAll().forEach(function (viewName) {
            actions.loadViewSettings({ viewName: viewName });
        });

    },

    loadViewSettings: function (inData) {

        let viewName = inData.viewName;

        common.sendToAllClients.call(that, "loaded", {
            viewName: viewName,
            viewSettings: getAllViewSettings(viewName)
        });

    },

    loadAllTemplatesForView: function (inData) {

        let viewName = inData.viewName;

        templatesList.getAll().forEach(function (templateName) {

            actions.loadTemplateForView({
                viewName: viewName,
                templateName: templateName
            });

        });

    },

    loadTemplateForView: function (inData) {

        let viewName = inData.viewName,
            templateName = inData.templateName;

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

        let templateName = inData.templateName;

        viewsList.getAll().forEach(function (viewName) {

            actions.loadTemplateForView({
                viewName: viewName,
                templateName: templateName
            });

        });

    },

    loadAllTemplatesForAllViews: function () {

        viewsList.getAll().forEach(function (viewName) {

            actions.loadAllTemplatesForView({
                viewName: viewName
            });

        });

    }

};

exports.init = function () {

}


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

    let systemSettings = getAllSystemSettings();
    let viewSettings = getAllViewSettings(viewName);
    let templateSettings = getAllTemplateSettings(templateName);

    return {
        system: systemSettings,
        view: viewSettings,
        template: templateSettings,
    };

}

function loadTemplateCss(viewName, templateName) {

    return templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.css);

}

const requiredFuncNames = ["init", "startIn", "startOut"];

function loadTemplateCodeCompiled(viewName, templateName) {

    let code = templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.code);

    let wrapp = "";

    wrapp += "  let htmlTemplate;\n";

    wrapp += "  let cssTemplate;\n";

    wrapp += "  return {\n";

    wrapp += "      instantiate: function(allSettingsData, templateName, instanceName) {\n";

    wrapp += "          let $instanceRoot;\n";
    wrapp += "          let $templateRoot;\n";

    wrapp += "          let $css;\n";

    wrapp += "          let instanceMode = 0;\n";
    
    wrapp += "          const template = allSettingsData.template;\n";
    wrapp += "          const view = allSettingsData.view;\n";
    wrapp += "          const system = allSettingsData.system;\n";

    wrapp += code + "\n";

    wrapp += "          return {\n";

    wrapp += "              getTemplateName: function () { return templateName; },\n"

    wrapp += "              getInstanceName: function () { return instanceName; },\n"

    wrapp += "              set$InstanceDom: function ($d) { $instanceRoot = $d; },\n"

    wrapp += "              set$TemplateDom: function ($d) { $templateRoot = $d; },\n"

    wrapp += "              get$InstanceDom: function () { return $instanceRoot; },\n"

    wrapp += "              set$Css: function ($c) { $css = $c; },\n"

    wrapp += "              get$Css: function () { return $css; },\n"

    wrapp += "              setMode: function (m) {  if (instanceMode != (m - 1)) { throw 'Stepping up error'; }\n"
    wrapp += "                instanceMode = m;\n"
    wrapp += "              },\n"

    wrapp += "              getMode: function () { return instanceMode; },\n"

    wrapp += requiredFuncNames.map(function (funcName) { return funcName + ":" + funcName; }).join(",\n");

    wrapp += "        };\n";

    wrapp += "      }\n";

    wrapp += "  };\n";

    return wrapp;

}

function loadTemplateHtml(viewName, templateName) {

    return templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.html);

}