let common = require('../commonServer.js');
let templatesEditor = require('../templates/templatesEditorServer.js');
let instancesCommon = require('../instances/instancesCommon.js');
let playerControl = require('../player/playerControlServer.js');
let instancesList = require('./instancesListServer.js');
let viewer = require('../viewer/viewerServer.js');

let fs = require('fs');
let that = this;

exports.key = "instancesEditor";

function getInstanceFieldsMould(templateName) {

    let template = templatesEditor.loadTemplate(templateName);
    return (template.settings || {}).instanceFieldsMould;

}

let loadInstance = exports.loadInstance = function (templateName, instanceName, instanceFieldsMould) {

    instanceFieldsMould = instanceFieldsMould || getInstanceFieldsMould(templateName);

    let filePath = instancesCommon.getInstanceSettingsFilePath(templateName, instanceName);

    let raw =  fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding)) : {};

    return common.applyFieldDefaults(raw, instanceFieldsMould);
}


let loadInstancesWithContext = exports.loadInstancesWithContext = function (templateName, instanceNames) {

    let instanceFieldsMould = getInstanceFieldsMould(templateName);

    let result = instanceNames.map(function (instanceName) {

        return {
            instanceName: instanceName,
            fields: loadInstance(templateName, instanceName, instanceFieldsMould)
        };

    });

    return {
        templateName: templateName,
        instances: result
    };

}

let actions = exports.actions = {

    load: function (inData) {

        let templateName = inData.templateName,
            instanceNames = inData.instanceNames;

        if (!instanceNames) {
            instanceNames = instancesList.getAll(templateName);
        }

        common.sendToAllClients.call(that, "loaded", loadInstancesWithContext(templateName, instanceNames));

    },

    save: function (inData) {

        let templateName = inData.templateName,
            instances = inData.instances;

        instances.forEach(function (instance) {

            let filePath = instancesCommon.getInstanceSettingsFilePath(templateName, instance.instanceName);

            fs.writeFileSync(filePath, JSON.stringify(instance.fields), common.fileEncoding);

        });

        actions.load(inData);
        playerControl.actions.loadAll();

    },

    add: function (inData) {

        instancesList.add(inData);

        delete inData.instanceName;

        actions.load(inData)

    },

    rename: function (inData) {

        instancesList.rename(inData);

        actions.load(inData)

    },

    delete: function (inData) {

        instancesList.delete(inData);

        delete inData.instanceName;

        actions.load(inData)

    },

    startIn: function (inData) {

        viewer.startIn(inData);
        
    },

    startOut: function (inData) {

        viewer.startOut(inData);
        
    }

};

exports.init = function () {

}