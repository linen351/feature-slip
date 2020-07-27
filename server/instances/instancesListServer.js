let common = require('../commonServer.js');
let instancesCommon = require('../instances/instancesCommon.js');
let playlistsListServer = require('../player/playlistsListServer');

let fs = require('fs');
let that = this;

exports.key = "instancesList";

let getAll = exports.getAll = function (templateName) {

    let path = instancesCommon.getInstancesFolderPath(templateName);

    if (!fs.existsSync(path)) {
        return [];
    }

    return fs.readdirSync(path);

};

let rename = exports.rename = function (inData) {

    let newInstanceName = inData.newInstanceName;
    let oldInstanceName = inData.oldInstanceName;

    if (!newInstanceName) {
        if (newInstanceName == "") {
            common.sendToAllClients.call(that, "warning", "No name");
        } 
        return;
    }

    let templateName = inData.templateName,
        oldPath = instancesCommon.getInstancePath(templateName, oldInstanceName),
        newPath = instancesCommon.getInstancePath(templateName, newInstanceName);

    if (fs.existsSync(newPath)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }

    playlistsListServer.renameContents({
        template: {
            oldName: templateName,
        },
        instance: {
            oldName: oldInstanceName,
            newName: newInstanceName
        }
    });

    fs.renameSync(oldPath, newPath);

    playlistsListServer.actions.loadAll();

};

let add = exports.add = function (inData) {

    let templateName = inData.templateName, 
        instanceName = inData.instanceName;

    if (!instanceName) {
        if (instanceName == "") {
            common.sendToAllClients.call(that, "warning", "Must give name");
        } return;
    }

    let instancesFolderPath = instancesCommon.getInstancesFolderPath(templateName);
    if (!fs.existsSync(instancesFolderPath)) {

        fs.mkdirSync(instancesFolderPath);

    }

    let path = instancesCommon.getInstancePath(templateName, instanceName);

    if (fs.existsSync(path)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }

    fs.mkdirSync(path);


};

let del = exports.delete = function (inData) {

    let path = instancesCommon.getInstancePath(inData.templateName, inData.instanceName)

    if (fs.existsSync(path)) {

        fs.readdirSync(path).forEach(file => {

            fs.unlinkSync(path + "\\" + file)

        });

        fs.rmdirSync(path);

    }

}


let actions = exports.actions = {

    getAll: function (inData) {

        common.sendToAllClients.call(that, "all", getAll(inData.templateName));

    },

    add: function (inData) {

        add(inData);

        actions.getAll(inData)

    },

    rename: function (inData) {

        rename(inData);

        actions.getAll(inData)

    },

    delete: function (inData) {

        del(inData);

        actions.getAll(inData)

    }

};

exports.init = function () {

}