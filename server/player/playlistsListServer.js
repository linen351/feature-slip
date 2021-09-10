"use strict";
exports.__esModule = true;
exports.init = exports.actions = exports.renameContents = exports.getAll = exports.key = void 0;
var common = require("../commonServer");
var playerCommon = require("./playercommonServer");
var playlistsEditorServer = require("./playlistsEditorServer");
var fs = require("fs");
exports.key = "playlistsList";
var that = this;
var getAll = function () {
    var folderPath = playerCommon.getPlaylistsFolderPath();
    return fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];
};
exports.getAll = getAll;
var renameContents = function (options) {
    (0, exports.getAll)().forEach(function (playlistName) {
        playlistsEditorServer.renameContent(playlistName, options);
    });
};
exports.renameContents = renameContents;
exports.actions = {
    loadAll: function () {
        (0, exports.getAll)().forEach(function (playlistName) {
            playlistsEditorServer.actions.load({ playlistName: playlistName });
        });
    },
    getAll: function () {
        common.sendToAllClients.call(that, "all", (0, exports.getAll)());
    },
    add: function (inData) {
        var playlistName = inData.playlistName;
        if (!playlistName) {
            common.sendToAllClients.call(that, "warning", "Must have name");
            return;
        }
        var folderPath = playerCommon.getPlaylistsFolderPath();
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        var path = playerCommon.getPlaylistPath(playlistName);
        if (fs.existsSync(path)) {
            common.sendToAllClients.call(that, "warning", "Already exists");
            return;
        }
        fs.mkdirSync(path);
        exports.actions.getAll();
    }
};
var init = function () { };
exports.init = init;
