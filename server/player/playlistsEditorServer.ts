import * as common from "../commonServer";
import * as playerCommon from "./playercommonServer";
import * as playlistsList from "./playlistsListServer";
import * as playerControl from "./playerControlServer";
import * as viewer from "../viewer/viewerServer";

import * as fs from "fs";

export const key = "playlistsEditor";

let that = this;

export const loadPlaylist = function (playlistName) {
  let filePath = playerCommon.getPlaylistSettingsFilePath(playlistName);

  let raw = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, common.fileEncoding))
    : [];

  if (playerControl.getActivePlaylistName() == playlistName) {
    let stepId = playerControl.getActivePlaylistActiveStepId();

    raw.forEach(function (item) {
      item.active = stepId == item.id;
    });
  }

  return raw;
};

let savePlaylist = function (playlistName, items) {
  let filePath = playerCommon.getPlaylistSettingsFilePath(playlistName);

  fs.writeFileSync(filePath, JSON.stringify(items), common.fileEncoding);
};

export const renameContent = function (playlistName, options) {
  let items = loadPlaylist(playlistName);

  let templateRename = options.template;
  let instanceRename = options.instance;

  let oldTemplateName = null;
  let newTemplateName = null;
  let oldInstanceName = null;
  let newInstanceName = null;

  if (templateRename) {
    oldTemplateName = templateRename.oldName;
    newTemplateName = templateRename.newName;

    if (instanceRename) {
      oldInstanceName = instanceRename.oldName;
      newInstanceName = instanceRename.newName;
    }
  } else {
    return;
  }

  items.forEach((item) => {
    if (
      oldTemplateName == item.templateName &&
      (!oldInstanceName || oldInstanceName == item.instanceName)
    ) {
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

export const rename = function (inData) {
  let newPlaylistName = inData.newPlaylistName;

  if (!newPlaylistName) {
    if (newPlaylistName == "") {
      common.sendToAllClients.call(that, "warning", "Must give name");
    }
    return;
  }

  let oldPath = playerCommon.getPlaylistPath(inData.oldPlaylistName),
    newPath = playerCommon.getPlaylistPath(newPlaylistName);

  if (fs.existsSync(newPath)) {
    common.sendToAllClients.call(that, "warning", "Already exists");
    return;
  }

  fs.renameSync(oldPath, newPath);
};

export const del = function (inData) {
  let path = playerCommon.getPlaylistPath(inData.playlistName);

  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      fs.unlinkSync(path + "\\" + file);
    });

    fs.rmdirSync(path);
  }
};

export const actions = {
  load: function (inData) {
    let playlistName = inData.playlistName;

    common.sendToAllClients.call(that, "loaded", {
      playlistName: playlistName,
      items: loadPlaylist(playlistName),
    });
  },

  save: function (inData) {
    let playlistName = inData.playlistName;
    let items = inData.items;

    savePlaylist(playlistName, items);

    actions.load(inData);
  },

  selectItem: function (inData) {
    if (playerControl.getActivePlaylistName() == inData.playlistName) {
      playerControl.actions.setActivePlaylistStepId(
        inData.id,
        inData.doStartIn,
        false,
        inData.viewName
      );
      actions.load(inData);
    }
  },

  startIn: function (inData) {
    inData.doStartIn = true;

    actions.selectItem(inData);
  },

  startOut: function (inData) {
    viewer.startOut(inData);
  },

  clearAll: function (inData) {
    viewer.startOut(inData);
    actions.selectItem({ playlistName: inData.playlistName });
  },

  setActivePlaylist: function (inData) {
    playerControl.actions.setActivePlaylist(inData);
    actions.load({
      playlistName: inData.playlistName || inData.loadedPlaylistName,
    });
  },

  navigatePlaylistPrev: function (inData) {
    playerControl.actions.navigatePlaylistPrev(inData);
    actions.load(inData);
  },

  navigatePlaylistRefresh: function (inData) {
    playerControl.actions.navigatePlaylistRefresh(inData);
    actions.load(inData);
  },

  navigatePlaylistNext: function (inData) {
    playerControl.actions.navigatePlaylistNext(inData);
    actions.load(inData);
  },

  rename: function (inData) {
    rename(inData);

    playlistsList.actions.getAll();

    actions.load({ playlistName: inData.newPlaylistName });
  },

  delete: function (inData) {
    del(inData);

    playlistsList.actions.getAll();
  },
};
