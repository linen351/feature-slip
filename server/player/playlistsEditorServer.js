"use strict";
exports.__esModule = true;
exports.actions = exports.del = exports.rename = exports.renameContent = exports.loadPlaylist = exports.key = void 0;
var common = require("../commonServer");
var playerCommon = require("./playercommonServer");
var playlistsList = require("./playlistsListServer");
var playerControl = require("./playerControlServer");
var viewer = require("../viewer/viewerServer");
var fs = require("fs");
exports.key = "playlistsEditor";
var that = this;
var loadPlaylist = function (playlistName) {
    var filePath = playerCommon.getPlaylistSettingsFilePath(playlistName);
    var raw = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding))
        : [];
    if (playerControl.getActivePlaylistName() == playlistName) {
        var stepId_1 = playerControl.getActivePlaylistActiveStepId();
        raw.forEach(function (item) {
            item.active = stepId_1 == item.id;
        });
    }
    return raw;
};
exports.loadPlaylist = loadPlaylist;
var savePlaylist = function (playlistName, items) {
    var filePath = playerCommon.getPlaylistSettingsFilePath(playlistName);
    fs.writeFileSync(filePath, JSON.stringify(items), common.fileEncoding);
};
var renameContent = function (playlistName, options) {
    var items = (0, exports.loadPlaylist)(playlistName);
    var templateRename = options.template;
    var instanceRename = options.instance;
    var oldTemplateName = null;
    var newTemplateName = null;
    var oldInstanceName = null;
    var newInstanceName = null;
    if (templateRename) {
        oldTemplateName = templateRename.oldName;
        newTemplateName = templateRename.newName;
        if (instanceRename) {
            oldInstanceName = instanceRename.oldName;
            newInstanceName = instanceRename.newName;
        }
    }
    else {
        return;
    }
    items.forEach(function (item) {
        if (oldTemplateName == item.templateName &&
            (!oldInstanceName || oldInstanceName == item.instanceName)) {
            if (oldTemplateName && newTemplateName) {
                item.templateName = newTemplateName;
            }
            if (oldInstanceName && newInstanceName) {
                item.instanceName = newInstanceName;
            }
        }
    });
    savePlaylist(playlistName, items);
};
exports.renameContent = renameContent;
var rename = function (inData) {
    var newPlaylistName = inData.newPlaylistName;
    if (!newPlaylistName) {
        if (newPlaylistName == "") {
            common.sendToAllClients.call(that, "warning", "Must give name");
        }
        return;
    }
    var oldPath = playerCommon.getPlaylistPath(inData.oldPlaylistName), newPath = playerCommon.getPlaylistPath(newPlaylistName);
    if (fs.existsSync(newPath)) {
        common.sendToAllClients.call(that, "warning", "Already exists");
        return;
    }
    fs.renameSync(oldPath, newPath);
};
exports.rename = rename;
var del = function (inData) {
    var path = playerCommon.getPlaylistPath(inData.playlistName);
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            fs.unlinkSync(path + "\\" + file);
        });
        fs.rmdirSync(path);
    }
};
exports.del = del;
exports.actions = {
    load: function (inData) {
        var playlistName = inData.playlistName;
        common.sendToAllClients.call(that, "loaded", {
            playlistName: playlistName,
            items: (0, exports.loadPlaylist)(playlistName)
        });
    },
    save: function (inData) {
        var playlistName = inData.playlistName;
        var items = inData.items;
        savePlaylist(playlistName, items);
        exports.actions.load(inData);
    },
    selectItem: function (inData) {
        if (playerControl.getActivePlaylistName() == inData.playlistName) {
            playerControl.actions.setActivePlaylistStepId(inData.id, inData.doStartIn, false, inData.viewName);
            exports.actions.load(inData);
        }
    },
    startIn: function (inData) {
        inData.doStartIn = true;
        exports.actions.selectItem(inData);
    },
    startOut: function (inData) {
        viewer.startOut(inData);
    },
    clearAll: function (inData) {
        viewer.startOut(inData);
        exports.actions.selectItem({ playlistName: inData.playlistName });
    },
    setActivePlaylist: function (inData) {
        playerControl.actions.setActivePlaylist(inData);
        exports.actions.load({
            playlistName: inData.playlistName || inData.loadedPlaylistName
        });
    },
    navigatePlaylistPrev: function (inData) {
        playerControl.actions.navigatePlaylistPrev(inData);
        exports.actions.load(inData);
    },
    navigatePlaylistRefresh: function (inData) {
        playerControl.actions.navigatePlaylistRefresh(inData);
        exports.actions.load(inData);
    },
    navigatePlaylistNext: function (inData) {
        playerControl.actions.navigatePlaylistNext(inData);
        exports.actions.load(inData);
    },
    rename: function (inData) {
        (0, exports.rename)(inData);
        playlistsList.actions.getAll();
        exports.actions.load({ playlistName: inData.newPlaylistName });
    },
    "delete": function (inData) {
        (0, exports.del)(inData);
        playlistsList.actions.getAll();
    }
};
