window.featureSlip.instances = window.featureSlip.instances || {};

window.featureSlip.instances.editor = (function () {

    let ns = featureSlip.common.initDefNs("instancesEditor"),
        loadedTemplateName,
        loaded = {},
        $viewerSelect,
        $viewerSelectMenu,
        selectedViewName;

    ns.init = function () {

        $viewerSelect = ns.$root.find(".viewer-select");
        $viewerSelectMenu = $viewerSelect.find(".menu");

        $viewerSelect.dropdown({
            forceSelection: false,
            onChange: function (value, text, $selectedItem) {
                selectedViewName = $selectedItem.data("viewName");
            }
        });

    };

    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        loaded: function (data) {

            loaded = data;
            loadedTemplateName = data.templateName;

            ns.$contentTarget.html(featureSlip.common.handlebarTemplates.instancesEditTable.get$Dom({
                templateName: loadedTemplateName,
                fieldsMould: loaded.instanceFieldsMould,
                instances: loaded.instances
            }));

        }

    };

    featureSlip.common.listenForIncomingFromServer({

        handler: "viewsList",
        action: "all",
        callback: function(allViewNames) {

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

    ns.clickHandlers = {

        save: function ($clicked, event) {

            ns.sendToServer("save", {
                templateName: loadedTemplateName,
                instances: featureSlip.common.handlebarTemplates.instancesEditTable.getJson(ns.$contentTarget)
            });

        },

        add: function ($clicked, event) {

            let instanceName = prompt("Give me a Name");

            ns.sendToServer("add", { templateName: loadedTemplateName, instanceName: instanceName });

        },

        rename: function ($clicked, event) {

            let oldInstanceName = $clicked.closest(".instance").data("instancename");
            let name = prompt("Give me a new Name", oldInstanceName);

            if (name) {

                ns.sendToServer("rename", {
                    templateName: loadedTemplateName,
                    oldInstanceName: oldInstanceName,
                    newInstanceName: name
                });

            }

        },

        delete: function ($clicked, event) {

            if (confirm("Are you sure?")) {
                ns.sendToServer("delete", {
                    templateName: loadedTemplateName,
                    instanceName: $clicked.closest(".instance").data("instancename")
                });
            }

        },

        startIn: function($clicked, event) {

            ns.sendToServer("startIn", {
                templateName: loadedTemplateName,
                instanceName: $clicked.closest(".instance").data("instancename"),
                viewName: selectedViewName
            });

        },

        startRefresh: function($clicked, event) {

            ns.sendToServer("startIn", {
                templateName: loadedTemplateName,
                instanceName: $clicked.closest(".instance").data("instancename"),
                viewName: selectedViewName,
                force: true
            });

        },

        startOut: function($clicked, event) {

            ns.sendToServer("startOut", {
                templateName: loadedTemplateName,
                instanceName: $clicked.closest(".instance").data("instancename"),
                viewName: selectedViewName
            });

        }

    };


    ns.clear = function () {

        ns.$contentTarget.empty();
        loadedTemplateName = null;

    };

    ns.load = function (templateName, instanceNames) {

        ns.clear();

        ns.sendToServer("load", {
            templateName: templateName,
            instanceNames: instanceNames
        });

    };

    return ns;

}());