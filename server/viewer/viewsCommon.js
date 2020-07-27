let common = require('../commonServer.js');

let fs = require('fs');

let rootPath = '../public/data/views';

const viewSettingsFileName = "view.json";

let getViewsFolderPath = exports.getViewsFolderPath = function() {
    return rootPath;
}

let getViewPath = exports.getViewPath = function getViewPath(viewName) {
    return getViewsFolderPath() + "/" + viewName;
};

exports.getViewSettingsFilePath = function (viewName) {
    return getViewPath(viewName) + "/" + viewSettingsFileName;
}