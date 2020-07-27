let common = require('../commonServer.js');
let playerCommon = require('./playerCommonServer.js');
let playlistsEditorServer = require('./playlistsEditorServer.js');


let fs = require('fs');

exports.key = "playlistsList";

let that = this;

let getAll = exports.getAll = function () {

    let folderPath = playerCommon.getPlaylistsFolderPath();

    return fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];

}

exports.renameContents = function (options) {

    getAll().forEach(playlistName => {

        playlistsEditorServer.renameContent(playlistName, options);

    });

}


let actions = exports.actions = {

    loadAll: function () {

        getAll().forEach(playlistName => {

            playlistsEditorServer.actions.load({ playlistName: playlistName });

        });

    },

    getAll: function () {

        common.sendToAllClients.call(that, "all", getAll());

    },

    add: function (inData) {

        let playlistName = inData.playlistName;

        if (!playlistName) {
            common.sendToAllClients.call(that, "warning", "Must have name");
            return;
        }

        let folderPath = playerCommon.getPlaylistsFolderPath();

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        let path = playerCommon.getPlaylistPath(playlistName);

        if (fs.existsSync(path)) {
            common.sendToAllClients.call(that, "warning", "Already exists");
            return;
        }

        fs.mkdirSync(path);

        actions.getAll()

    }

}

exports.init = function () {

}