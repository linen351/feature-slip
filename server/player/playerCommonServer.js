"use strict";
exports.__esModule = true;
exports.getPlaylistSettingsFilePath = exports.getPlaylistPath = exports.getPlaylistsFolderPath = void 0;
var rootPath = "../public/data/playlists";
var playlistSettingsFileName = "playlist.json";
var getPlaylistsFolderPath = function () {
    return rootPath;
};
exports.getPlaylistsFolderPath = getPlaylistsFolderPath;
var getPlaylistPath = function (playlistName) {
    return (0, exports.getPlaylistsFolderPath)() + "/" + playlistName;
};
exports.getPlaylistPath = getPlaylistPath;
var getPlaylistSettingsFilePath = function (playlistName) {
    return (0, exports.getPlaylistPath)(playlistName) + "/" + playlistSettingsFileName;
};
exports.getPlaylistSettingsFilePath = getPlaylistSettingsFilePath;
