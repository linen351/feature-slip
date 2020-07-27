let common = require('../commonServer.js');
let templatesList = require('../templates/templatesListServer.js');
let instancesList = require('../instances/instancesListServer.js');
let viewer = require('../viewer/viewerServer.js');
let viewsList = require('../viewer/viewsListServer.js');
let playlistEditor = require('./playlistsEditorServer.js');

exports.key = "playerControl";

let that = this,
    activePlaylistName,
    activePlaylistActiveStepId;

let getActivePlaylistName = exports.getActivePlaylistName = function () {
    return activePlaylistName;
}

let getActivePlaylistActiveStepId = exports.getActivePlaylistActiveStepId = function () {
    return activePlaylistActiveStepId;
};

let getActivePlaylist = exports.getActivePlaylist = function () {

    return playlistEditor.loadPlaylist(getActivePlaylistName());

};

let actions = exports.actions = {

    loadAll: function () {

        let all = templatesList.getAllActive().map(function (templateName) {

            return {

                templateName: templateName,
                instanceNames: instancesList.getAll(templateName)

            };

        });

        common.sendToAllClients.call(that, "all", all);

    },

    loadActivePlaylist: function () {

        let items = getActivePlaylist();

        common.sendToAllClients.call(that, "activePlaylist", {
            playlistName: getActivePlaylistName(),
            items: items
        });

    },

    setActivePlaylist: function (inData) {

        activePlaylistName = inData.playlistName;

        this.setActivePlaylistStepId(null);

        actions.loadActivePlaylist();

    },

    setActivePlaylistStepId: function (stepId, doStartIn, force, viewName) {

        activePlaylistActiveStepId = stepId;

        if (doStartIn) {
            let items = getActivePlaylist();

            let selectedItem = items.find(function (item) {
                return activePlaylistActiveStepId == item.id;
            });

            if (selectedItem) {

                selectedItem.force = force;
                selectedItem.viewName = viewName;

                console.trace("startin");

                console.log("startin", selectedItem);
                actions.startIn(selectedItem);

            }
        }

        actions.loadActivePlaylist();

    },

    navigatePlaylistPrev: function (inData) {

        let items = getActivePlaylist();

        let stepId = getActivePlaylistActiveStepId();

        if (!stepId) {
            return;
        }

        let index = items.findIndex(function (item) {
            return stepId == item.id;
        }) - 1;



        if (index < 0) {
            return;
        }

        actions.setActivePlaylistStepId(items[index].id, true, null, inData.viewName);

    },

    navigatePlaylistRefresh: function (inData) {

        actions.setActivePlaylistStepId(getActivePlaylistActiveStepId(), true, true, inData.viewName);

    },

    navigatePlaylistNext: function (inData) {

        let items = getActivePlaylist();

        let stepId = getActivePlaylistActiveStepId();

        let index = stepId ? items.findIndex(function (item) {
            return stepId == item.id;
        }) + 1 : 0;

        if (items.length <= index) {
            return;
        }

        actions.setActivePlaylistStepId(items[index].id, true, null, inData.viewName);

    },

    startIn: function (inData) {

        viewer.startIn(inData);

    },

    startOut: function (inData) {

        viewer.startOut(inData);

    }

}

exports.connected = function () {

    actions.loadActivePlaylist();

};