window.featureSlip.player = window.featureSlip.player || {};

window.featureSlip.player.control = (function () {

    // if (window.featureSlip.userType < window.featureSlip.userTypesToNumber.runner) {
    //     return;
    // }

    let ns = featureSlip.common.initDefNs("playerControl");

    let selectedViewName,
        activePlaylist,
        $viewerSelect,
        $viewerSelectMenu;

    ns.init = function () {

        let $root = ns.$root;

        ns.sendToServer("loadAll");

        ns.sendToServer("loadActivePlaylist");

        $viewerSelect = $root.find(".viewer-select");
        $viewerSelectMenu = $viewerSelect.find(".menu");

        $viewerSelect.dropdown({
            forceSelection: false,
            onChange: function (value, text, $selectedItem) {
                selectedViewName = $selectedItem.data("viewName");
            }
        });

    }

    featureSlip.common.listenForIncomingFromServer({

        handler: "viewsList",
        action: "all",
        callback: function (allViewNames) {

            $viewerSelectMenu.empty();

            $('<div class="item">All</div>')
                .appendTo($viewerSelectMenu)
                .data("viewName", null);

            allViewNames.forEach(function (viewName) {

                $('<div class="item">' + viewName + '</div>')
                    .appendTo($viewerSelectMenu)
                    .data("viewName", viewName);

            })

        }

    });


    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        all: function (data) {

            let $contentTarget = ns.$contentTarget;

            $contentTarget.empty();

            data
                .map(function (template) {

                    let templateName = template.templateName;

                    return {
                        templateName: templateName,
                        items: template.instanceNames
                            .map(function (instanceName) {
                                return {
                                    name: instanceName,
                                    templateName: templateName,
                                    instanceName: instanceName
                                };
                            })
                    };
                })
                .forEach(function (list) {

                    $contentTarget.append(featureSlip.common.handlebarTemplates.instancePlayer.get$Dom(list));

                });

        },

        activePlaylist: function (data) {

            activePlaylist = data;

        }

    };

    ns.getActivePlaylistName = function () {

        return activePlaylist && activePlaylist.playlistName;

    };

    ns.setActivePlaylist = function (playlistName) {

        ns.sendToServer("setActivePlaylist", { playlistName: playlistName });

    };

    // ns.prev = function() {

    //     ns.sendToServer("navigatePlaylistPrev");

    // };

    // ns.next = function() {

    //     ns.sendToServer("navigatePlaylistNext");

    // };

    function getClickedEventHandler(action, additionalPropsCallback) {

        return featureSlip.common.handlebarTemplates.items.getClickedEventHandler(
            function (props) { ns.sendToServer(action, props); },
            function (props) {
                if (additionalPropsCallback) {
                    additionalPropsCallback(props);
                }
                props.viewName = selectedViewName;
            });

    }

    ns.clickHandlers = {

        startIn: getClickedEventHandler("startIn"),

        startRefresh: getClickedEventHandler("startIn", function (props) {
            props.force = true;
        }),

        startOut: getClickedEventHandler("startOut"),

        stopAll: function () {

            ns.sendToServer("startOut", {
                viewName: selectedViewName
            });

        }

    };


    ns.clear = function () {

        ns.$contentTarget.empty();
        loadedViewName = null;

    };

    ns.load = function () {
    };

    return ns;

}());