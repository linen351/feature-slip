import * as common from "../commonServer";
import * as playerCommon from "./playercommonServer";
import * as playlistsEditorServer from "./playlistsEditorServer";

import * as fs from "fs";

export const key = "playlistsList";

let that = this;

export const getAll = function () {
  let folderPath = playerCommon.getPlaylistsFolderPath();

  return fs.existsSync(folderPath) ? fs.readdirSync(folderPath) : [];
};

export const renameContents = function (options) {
  getAll().forEach((playlistName) => {
    playlistsEditorServer.renameContent(playlistName, options);
  });
};

export const actions = {
  loadAll: function () {
    getAll().forEach((playlistName) => {
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

    actions.getAll();
  },
};

export const init = function () {};
