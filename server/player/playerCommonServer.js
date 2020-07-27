const rootPath = '../public/data/playlists';

const playlistSettingsFileName = "playlist.json";

let getPlaylistsFolderPath = exports.getPlaylistsFolderPath = function() {
    return rootPath;
}

let getPlaylistPath = exports.getPlaylistPath = function (playlistName) {
    return getPlaylistsFolderPath() + "/" + playlistName;
}

exports.getPlaylistSettingsFilePath = function (playlistName) {
    return getPlaylistPath(playlistName) + "/" + playlistSettingsFileName;
}
