"use strict";
exports.__esModule = true;
exports.connected = exports.actions = exports.getActivePlaylist = exports.getActivePlaylistActiveStepId = exports.getActivePlaylistName = exports.key = void 0;
var common = require("../commonServer");
var templatesList = require("../templates/templatesListServer");
var instancesList = require("../instances/instancesListServer");
var viewer = require("../viewer/viewerServer");
var playlistEditor = require("./playlistsEditorServer");
exports.key = "playerControl";
var that = this, activePlaylistName, activePlaylistActiveStepId;
var getActivePlaylistName = function () {
    return activePlaylistName;
};
exports.getActivePlaylistName = getActivePlaylistName;
var getActivePlaylistActiveStepId = function () {
    return activePlaylistActiveStepId;
};
exports.getActivePlaylistActiveStepId = getActivePlaylistActiveStepId;
var getActivePlaylist = function () {
    return playlistEditor.loadPlaylist((0, exports.getActivePlaylistName)());
};
exports.getActivePlaylist = getActivePlaylist;
exports.actions = {
    loadAll: function () {
        var all = templatesList.getAllActive().map(function (templateName) {
            return {
                templateName: templateName,
                instanceNames: instancesList.getAll(templateName)
            };
        });
        common.sendToAllClients.call(that, "all", all);
    },
    loadActivePlaylist: function () {
        var items = (0, exports.getActivePlaylist)();
        common.sendToAllClients.call(that, "activePlaylist", {
            playlistName: (0, exports.getActivePlaylistName)(),
            items: items
        });
    },
    setActivePlaylist: function (inData) {
        activePlaylistName = inData.playlistName;
        this.setActivePlaylistStepId(null);
        exports.actions.loadActivePlaylist();
    },
    setActivePlaylistStepId: function (stepId, doStartIn, force, viewName) {
        activePlaylistActiveStepId = stepId;
        if (doStartIn) {
            var items = (0, exports.getActivePlaylist)();
            var selectedItem = items.find(function (item) {
                return activePlaylistActiveStepId == item.id;
            });
            if (selectedItem) {
                selectedItem.force = force;
                selectedItem.viewName = viewName;
                console.trace("startin");
                console.log("startin", selectedItem);
                exports.actions.startIn(selectedItem);
            }
        }
        exports.actions.loadActivePlaylist();
    },
    navigatePlaylistPrev: function (inData) {
        var items = (0, exports.getActivePlaylist)();
        var stepId = (0, exports.getActivePlaylistActiveStepId)();
        if (!stepId) {
            return;
        }
        var index = items.findIndex(function (item) {
            return stepId == item.id;
        }) - 1;
        if (index < 0) {
            return;
        }
        exports.actions.setActivePlaylistStepId(items[index].id, true, null, inData.viewName);
    },
    navigatePlaylistRefresh: function (inData) {
        exports.actions.setActivePlaylistStepId((0, exports.getActivePlaylistActiveStepId)(), true, true, inData.viewName);
    },
    navigatePlaylistNext: function (inData) {
        var items = (0, exports.getActivePlaylist)();
        var stepId = (0, exports.getActivePlaylistActiveStepId)();
        var index = stepId
            ? items.findIndex(function (item) {
                return stepId == item.id;
            }) + 1
            : 0;
        if (items.length <= index) {
            return;
        }
        exports.actions.setActivePlaylistStepId(items[index].id, true, null, inData.viewName);
    },
    startIn: function (inData) {
        viewer.startIn(inData);
    },
    startOut: function (inData) {
        viewer.startOut(inData);
    }
};
var connected = function () {
    exports.actions.loadActivePlaylist();
};
exports.connected = connected;
