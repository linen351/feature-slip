window.featureSlip.playlists = window.featureSlip.playlists || {};

window.featureSlip.playlists.editor = (function () {

    let ns = featureSlip.common.initDefNs("playlistsEditor"),
        loadedPlaylistName,
        loadedItems,
        $playlistName,
        $root;

    let selectedViewName,
        $viewerSelect,
        $viewerSelectMenu;

    let $itemSelect,
        $itemSelectMenu;

    const userType = window.featureSlip.userType;
    const userTypesToNumber = window.featureSlip.userTypesToNumber;
    const runIsAllowed = userTypesToNumber.admin == userType || userTypesToNumber.runner == userType;
    const editIsAllowed = userTypesToNumber.admin == userType || userTypesToNumber.editor == userType;

    ns.init = function () {

        $root = ns.$root;

        $playlistName = $root.find(".playlist-name");
        $fieldEditor = ns.$contentTarget;

        $viewerSelect = $root.find(".viewer-select");
        $viewerSelectMenu = $viewerSelect.find(".menu");

        $itemSelect = $root.find(".item-select");
        $itemSelectMenu = $itemSelect.find(".menu");

        if (runIsAllowed) {

            $viewerSelect.dropdown({
                forceSelection: false,
                onChange: function (value, text, $selectedItem) {
                    selectedViewName = $selectedItem.data("viewName");
                }
            });

            document.addEventListener("keydown", event => {
                //console.log(event.keyCode);
    
                switch (event.keyCode) {
                    case 32:
                        ns.clickHandlers.navNext();
                        break;
                }
    
            });

        }


        if (editIsAllowed) {

            $itemSelect.dropdown({
                forceSelection: false,
                onChange: function (value, text, $selectedItem) {

                    if ($selectedItem) {

                        loadedItems.push({
                            id: Math.floor(Math.random() * 100000),
                            templateName: $selectedItem.data("templatename"),
                            instanceName: $selectedItem.data("instancename")
                        })

                        refresh();

                        $itemSelect.dropdown("clear");

                    }
                }
            });

        }

    };


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


    featureSlip.common.listenForIncomingFromServer({

        handler: "playerControl",
        action: "all",
        callback: function (data) {

            $itemSelectMenu.empty();

            data.forEach(function (template) {

                let templateName = template.templateName;

                $('<div class="header">' + templateName + '</div><div class="divider"></div>').appendTo($itemSelectMenu);

                template.instanceNames.forEach(function (instanceName) {

                    $('<div class="item" data-templatename="' + templateName + '" data-instancename="' + instanceName + '">' + instanceName + '</div>').appendTo($itemSelectMenu);

                });

            });

        }

    });

    featureSlip.common.listenForIncomingFromServer({

        handler: "playerControl",
        action: "activePlaylist",
        callback: function (data) {

            if (loadedPlaylistName == data.playlistName) {

                loadedItems = data.items;

            }

            refresh();

        }

    });

    function refresh() {

        let currentActivePlaylistName = featureSlip.player.control.getActivePlaylistName();

        let thisIsActive = currentActivePlaylistName == loadedPlaylistName;

        $root[thisIsActive ? "addClass" : "removeClass"]("active-playlist");

        let $contentTarget = ns.$contentTarget;

        $contentTarget.empty();

        if (thisIsActive || !(userType == userTypesToNumber.runner || userType == userTypesToNumber.admin)) {
            $root.find(".segment").removeClass("disabled");
        } else {
            $root.find(".segment").addClass("disabled");
        }

        if (loadedItems) {

            let $editor = featureSlip.common.handlebarTemplates.items.get$Dom(loadedItems.map(function (item) {

                let viewName = item.viewName,
                    templateName = item.templateName,
                    instanceName = item.instanceName;

                item.editable = runIsAllowed;
                item.name = (viewName ? viewName + "/" : "") + (templateName ? templateName + "/" : "") + instanceName;

                return item;

            }));

            if (runIsAllowed || editIsAllowed) {

                $editor
                    .find("tr")
                    .on("dragstart", function (ev) {

                        let originalEv = ev.originalEvent;
                        originalEv.dropEffect = "move";
                        originalEv.dataTransfer.setData("text", $(this).data("id"));

                    })
                    .on("dragover", function (ev) {

                        ev.preventDefault();

                    })
                    .on("drop", function (ev) {

                        let originalEv = ev.originalEvent;

                        originalEv.preventDefault();

                        let $droppedRow = $editor.find('tr.row_' + originalEv.dataTransfer.getData("text"));
                        if ($droppedRow.length) {

                            let $target = $(originalEv.currentTarget);

                            if ($editor.get(0) === $target.closest("table").get(0)) {

                                $(originalEv.currentTarget).after($droppedRow);

                            }
                        }

                    });

            }

            $contentTarget.append($editor);

        }

    }

    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        loaded: function (data) {

            loadedPlaylistName = data.playlistName;

            loadedItems = data.items;

            $playlistName.html(loadedPlaylistName);

            refresh();

            $root.show();

        }

    };


    function getClickedEventHandler(action, additionalPropsCallback) {

        return featureSlip.common.handlebarTemplates.items.getClickedEventHandler(
            function (props) { ns.sendToServer(action, props); },
            function (props) {
                if (additionalPropsCallback) {
                    additionalPropsCallback(props);
                }
                props.playlistName = loadedPlaylistName;
                props.viewName = selectedViewName || props.viewName;
            });

    }

    ns.clickHandlers = {

        startIn: runIsAllowed && getClickedEventHandler("startIn"),

        startRefresh: runIsAllowed && getClickedEventHandler("startIn", function (props) {
            props.force = true;
        }),

        startOut: runIsAllowed && getClickedEventHandler("startOut"),

        clearAll: runIsAllowed && getClickedEventHandler("clearAll"),

        selectItem: runIsAllowed && getClickedEventHandler("selectItem"),

        deleteItem: editIsAllowed && function ($clicked) {

            $clicked.closest("tr").remove();

        },

        activate: runIsAllowed && function ($clicked, event) {

            let playerControl = featureSlip.player.control;

            if (loadedPlaylistName) {

                let currentActivePlaylistName = playerControl.getActivePlaylistName();

                if (loadedPlaylistName != currentActivePlaylistName) {

                    if (!currentActivePlaylistName || confirm("This will deactivate the active playlist (" + currentActivePlaylistName + ") and activate this.")) {

                        ns.sendToServer("setActivePlaylist", { playlistName: loadedPlaylistName });

                    }

                }


            }

        },

        deactivate: runIsAllowed && function ($clicked, event) {

            if (confirm("This will deactivate the active playlist (" + loadedPlaylistName + "). No playlist will be active.")) {

                ns.sendToServer("setActivePlaylist", { playlistName: null, loadedPlaylistName: loadedPlaylistName });

            }

        },

        navPrev: runIsAllowed && function () {

            ns.sendToServer("navigatePlaylistPrev", { playlistName: loadedPlaylistName, viewName: selectedViewName });

        },

        navRefresh: runIsAllowed && function () {

            ns.sendToServer("navigatePlaylistRefresh", { playlistName: loadedPlaylistName, viewName: selectedViewName });

        },

        navNext: runIsAllowed && function () {

            ns.sendToServer("navigatePlaylistNext", { playlistName: loadedPlaylistName, viewName: selectedViewName });

        },

        save: (runIsAllowed || editIsAllowed) && function ($clicked, event) {

            loadedItems = featureSlip.common.handlebarTemplates.items.getJson(ns.$contentTarget);

            ns.sendToServer("save", {
                playlistName: loadedPlaylistName,
                items: loadedItems
            });

        },

        rename: editIsAllowed && function ($clicked, event) {

            let name = prompt("Give me a new Name", loadedPlaylistName);

            if (name) {
                ns.sendToServer("rename", {
                    oldPlaylistName: loadedPlaylistName,
                    newPlaylistName: name
                });
            }

        },

        delete: editIsAllowed && function ($clicked, event) {

            if (confirm("Are you sure?")) {
                ns.sendToServer("delete", { playlistName: $clicked.closest("tr").data("name") });
            }

        }

    };


    ns.clear = function () {

        ns.$contentTarget.empty();
        loadedPlaylistName = null;

    };

    ns.load = function (playlistName) {

        ns.clear();

        ns.sendToServer("load", {
            playlistName: playlistName
        });

    };

    return ns;

}());