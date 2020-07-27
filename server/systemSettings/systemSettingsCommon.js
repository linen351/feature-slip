let common = require('../commonServer.js');

let fs = require('fs');

const systemSettingsPath = exports.systemSettingsPath = '../public/data/systemSettings.json';

exports.getSystemSettings = function() {

    return JSON.parse(fs.readFileSync(systemSettingsPath, common.fileEncoding));

}