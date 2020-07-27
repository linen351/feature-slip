let common = require('../commonServer.js');
let templatesCommon = require('./templatesCommon.js');
let templatesEditor = require('./templatesEditorServer.js');

let fs = require('fs');
let that = this;

exports.key = "templatesList";

let getAll = exports.getAll = function () {

    return fs.readdirSync(templatesCommon.getTemplatesFolderPath());

};

let getAllActive = exports.getAllActive = function () {

    return getAll().filter(function(templateName) {

        let settings = templatesEditor.loadTemplate(templateName, templatesCommon.filesForTemplate.settings);

        return settings.templateSettings.some(f => f.name == 'active' && f.value);

    })

};

let actions = exports.actions = {

    getAll: function () {

        common.sendToAllClients.call(that, "all", getAll());

    },

    getAllActive: function () {

        common.sendToAllClients.call(that, "all", getAllActive());

    },

    add: function (inData) {

        let templateName = inData.templateName;

        if (!templateName) {
            common.sendToAllClients.call(that, "warning", "Must have name");
            return;
        }

        let path = templatesCommon.getTemplatePath(templateName);

        if (fs.existsSync(path)) {
            common.sendToAllClients.call(that, "warning", "Already exists");
            return;
        }

        fs.mkdirSync(path);

        actions.getAll()

    }

};

exports.init = function () {

}