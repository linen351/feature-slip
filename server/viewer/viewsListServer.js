let common = require('../commonServer.js');
let viewsCommon = require('../viewer/viewsCommon.js');

let fs = require('fs');
let that = this;

exports.key = "viewsList";

let getAll = exports.getAll = function () {

    return fs.readdirSync(viewsCommon.getViewsFolderPath());

};


let actions = exports.actions = {

    getAll: function (inData) {

        common.sendToAllClients.call(that, "all", getAll());

    },

    add: function (inData) {

        let viewName = inData.viewName;

        if (!viewName) {
            common.sendToAllClients.call(that, "warning", "Must have name");
            return;
        }

        let folderPath = viewsCommon.getViewsFolderPath();

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        let path = viewsCommon.getViewPath(viewName);

        if (fs.existsSync(path)) {
            common.sendToAllClients.call(that, "warning", "Already exists");
            return;
        }

        fs.mkdirSync(path);

        actions.getAll()

    }

};

exports.init = function () {

};