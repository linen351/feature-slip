import * as common from "../commonServer";
import * as templatesList from "../templates/templatesListServer";
import * as instancesList from "../instances/instancesListServer";
import * as viewer from "../viewer/viewerServer";
import * as viewsList from "../viewer/viewsListServer";
import * as playlistEditor from "./playlistsEditorServer";

export const key = "playerControl";

let that = this,
  activePlaylistName,
  activePlaylistActiveStepId;

export const getActivePlaylistName = function () {
  return activePlaylistName;
};

export const getActivePlaylistActiveStepId = function () {
  return activePlaylistActiveStepId;
};

export const getActivePlaylist = function () {
  return playlistEditor.loadPlaylist(getActivePlaylistName());
};

export const actions = {
  loadAll: function () {
    let all = templatesList.getAllActive().map(function (templateName) {
      return {
        templateName: templateName,
        instanceNames: instancesList.getAll(templateName),
      };
    });

    common.sendToAllClients.call(that, "all", all);
  },

  loadActivePlaylist: function () {
    let items = getActivePlaylist();

    common.sendToAllClients.call(that, "activePlaylist", {
      playlistName: getActivePlaylistName(),
      items: items,
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

    let index =
      items.findIndex(function (item) {
        return stepId == item.id;
      }) - 1;

    if (index < 0) {
      return;
    }

    actions.setActivePlaylistStepId(
      items[index].id,
      true,
      null,
      inData.viewName
    );
  },

  navigatePlaylistRefresh: function (inData) {
    actions.setActivePlaylistStepId(
      getActivePlaylistActiveStepId(),
      true,
      true,
      inData.viewName
    );
  },

  navigatePlaylistNext: function (inData) {
    let items = getActivePlaylist();

    let stepId = getActivePlaylistActiveStepId();

    let index = stepId
      ? items.findIndex(function (item) {
          return stepId == item.id;
        }) + 1
      : 0;

    if (items.length <= index) {
      return;
    }

    actions.setActivePlaylistStepId(
      items[index].id,
      true,
      null,
      inData.viewName
    );
  },

  startIn: function (inData) {
    viewer.startIn(inData);
  },

  startOut: function (inData) {
    viewer.startOut(inData);
  },
};

export const connected = function () {
  actions.loadActivePlaylist();
};
