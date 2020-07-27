window.featureSlip.playlists = window.featureSlip.playlists || {};

window.featureSlip.playlists.list = (function () {

    let ns = featureSlip.common.initDefNs("playlistsList"),
        all = [],
        selectedPlaylistName;

    const userType = window.featureSlip.userType;
    const userTypesToNumber = window.featureSlip.userTypesToNumber;
    const addIsAllowed = userTypesToNumber.editor == userType || userTypesToNumber.admin == userType;

    ns.init = function () {

        ns.sendToServer("getAll");

    };


    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        all: function (data) {

            all = data;
            redraw();

        }

    };


    ns.clickHandlers = {

        item: function ($clicked, event) {

            let name = $clicked.closest(".item").data("name");

            select(name);

            featureSlip.playlists.editor.load(name);

        },

        add: function ($clicked, event) {

            let playlistName = prompt("Give me a Name");

            ns.sendToServer("add", { playlistName: playlistName });

        }

    };


    function redraw() {

        ns.$root.html(featureSlip.common.handlebarTemplates.selectList.get$Dom({
            all: all.map(function (playlistName) {
                return {
                    name: playlistName,
                    selected: playlistName == selectedPlaylistName
                }
            }),
            allowAdd: addIsAllowed
        }));

    }


    function select(playlistName) {
        selectedPlaylistName = playlistName;

        redraw();

        featureSlip.playlists.editor.load(selectedPlaylistName);

    }

    return ns;

}());