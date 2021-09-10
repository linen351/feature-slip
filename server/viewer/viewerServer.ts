import * as common from "../commonServer";

import * as systemSettingsCommon from "../systemSettings/systemSettingsCommon";
import * as templatesCommon from "../templates/templatesCommon";
import * as templatesEditor from "../templates/templatesEditorServer";
import * as templatesList from "../templates/templatesListServer";
import * as instancesEditor from "../instances/instancesEditorServer";
import * as instancesList from "../instances/instancesListServer";
import * as viewsEditor from "../viewer/viewsEditorServer";
import * as viewsList from "../viewer/viewsListServer";
import * as utilities from "../../public/utilities/utilities";

const that = this;

import * as Handlebars from "../../public/thirdparty/handlebars-v4.0.11";

export const key = "viewer";

export const startIn = function (inData) {
  let templateName = inData.templateName,
    instanceName = inData.instanceName;

  inData.instanceSettings = getAllInstanceSettings(templateName, instanceName);

  common.sendToAllClients.call(that, "startIn", inData);
};

export const startOut = function (inData) {
  let templateName = inData.templateName,
    instanceName = inData.instanceName;

  common.sendToAllClients.call(that, "startOut", inData);
};

export const actions = {
  loadSystemSettings: function () {
    common.sendToAllClients.call(that, "loaded", {
      systemSettings: getAllSystemSettings(),
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
      viewSettings: getAllViewSettings(viewName),
    });
  },

  loadAllTemplatesForView: function (inData) {
    let viewName = inData.viewName;

    templatesList.getAll().forEach(function (templateName) {
      actions.loadTemplateForView({
        viewName: viewName,
        templateName: templateName,
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
        settings: getAllTemplateSettings(templateName),
      },
    });
  },

  loadTemplateForAllViews: function (inData) {
    let templateName = inData.templateName;

    viewsList.getAll().forEach(function (viewName) {
      actions.loadTemplateForView({
        viewName: viewName,
        templateName: templateName,
      });
    });
  },

  loadAllTemplatesForAllViews: function () {
    viewsList.getAll().forEach(function (viewName) {
      actions.loadAllTemplatesForView({
        viewName: viewName,
      });
    });
  },
};

export const init = function () {};

function getAllSystemSettings() {
  return systemSettingsCommon.getSystemSettings().constants;
}

function getAllTemplateSettings(templateName) {
  return templatesEditor.loadTemplate(
    templateName,
    templatesCommon.filesForTemplate.settings
  );
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
  return templatesEditor.loadTemplate(
    templateName,
    templatesCommon.filesForTemplate.css
  );
}

const requiredFuncNames = ["init", "startIn", "startOut"];

function loadTemplateCodeCompiled(viewName, templateName) {
  let code = templatesEditor.loadTemplate(
    templateName,
    templatesCommon.filesForTemplate.code
  );

  let wrapp = "";

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
  return templatesEditor.loadTemplate(
    templateName,
    templatesCommon.filesForTemplate.html
  );
}
