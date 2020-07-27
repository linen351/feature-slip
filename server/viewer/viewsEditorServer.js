let common = require('../commonServer.js');
let viewsCommon = require('../viewer/viewsCommon.js');
let systemSettingsCommon = require('../systemSettings/systemSettingsCommon.js');
let viewsList = require('./viewsListServer.js');
let viewer = require('../viewer/viewerServer.js');

let fs = require('fs');
let that = this;

exports.key = "viewsEditor";

function getViewFieldsMould() {

    let systemSettings = systemSettingsCommon.getSystemSettings();
    return systemSettings.viewFieldsMould;

}

let loadView = exports.loadView = function (viewName, viewFieldsMould) {

    viewFieldsMould = viewFieldsMould || getViewFieldsMould(viewName);

    let filePath = viewsCommon.getViewSettingsFilePath(viewName);

    let raw = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding)) : {};

    return common.applyFieldDefaults(raw, viewFieldsMould);

};


let rename = exports.rename = function (inData) {

    let newViewName = inData.newViewName;

    if (!newViewName) {
        if (newViewName == "") {
            common.sendToAllClients.call(that, "warning", "Must give name");
        }
        return;
    }

    let oldPath = viewsCommon.getViewPath(inData.oldViewName),
        newPath = viewsCommon.getViewPath(newViewName);

    if (fs.existsSync(newPath)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }

    fs.renameSync(oldPath, newPath);

}

let del = exports.delete = function (inData) {

    let path = viewsCommon.getViewPath(inData.viewName);

    if (fs.existsSync(path)) {

        fs.readdirSync(path).forEach(file => {

            fs.unlinkSync(path + "\\" + file)

        });

        fs.rmdirSync(path);

    }

}


let actions = exports.actions = {

    load: function (inData) {

        let viewName = inData.viewName;

        common.sendToAllClients.call(that, "loaded", {
            viewName: viewName,
            fields: loadView(viewName)
        });

    },

    save: function (inData) {

        let viewName = inData.viewName;

        let filePath = viewsCommon.getViewSettingsFilePath(viewName);

        fs.writeFileSync(filePath, JSON.stringify(inData.fields), common.fileEncoding);

        actions.load(inData);

        viewer.actions.loadViewSettings({ viewName: viewName });

    },

    rename: function (inData) {

        rename(inData);

        viewsList.actions.getAll()

        actions.load({ viewName: inData.newViewName });


    },

    delete: function (inData) {

        del(inData);

        viewsList.actions.getAll()

    }

};

exports.init = function () {

}