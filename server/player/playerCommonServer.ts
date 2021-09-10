const rootPath = "../public/data/playlists";

const playlistSettingsFileName = "playlist.json";

export const getPlaylistsFolderPath = function () {
  return rootPath;
};

export const getPlaylistPath = function (playlistName) {
  return getPlaylistsFolderPath() + "/" + playlistName;
};

export const getPlaylistSettingsFilePath = function (playlistName) {
  return getPlaylistPath(playlistName) + "/" + playlistSettingsFileName;
};
