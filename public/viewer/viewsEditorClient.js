window.featureSlip.systemSettings = window.featureSlip.systemSettings || {};

window.featureSlip.systemSettings.views = window.featureSlip.systemSettings.views || {};

window.featureSlip.systemSettings.views.editor = (function () {

    let ns = featureSlip.common.initDefNs("viewsEditor"),
        loadedViewName,
        loadedFields,
        $viewName,
        $fieldEditor,
        $open,
        $root;

    ns.init = function () {

        $root = ns.$root;

        $viewName = $root.find(".view-name");
        $fieldEditor = ns.$contentTarget;
        $open = $root.find(".open");

    };

    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        loaded: function (data) {

            loadedViewName = data.viewName;

            loadedFields = data.fields;

            $viewName.html(loadedViewName);

            $fieldEditor.html(featureSlip.common.handlebarTemplates.singleFieldsTable.get$Dom({
                viewName: loadedViewName,
                fields: data.fields
            }));

            $root.show();

        }

    };

    ns.clickHandlers = {

        save: function ($clicked, event) {

            ns.sendToServer("save", {
                viewName: loadedViewName,
                fields: featureSlip.common.handlebarTemplates.singleFieldsTable.getJson($fieldEditor)
            });

        },

        rename: function ($clicked, event) {

            let name = prompt("Give me a new Name", loadedViewName);

            if (name) {
                ns.sendToServer("rename", {
                    oldViewName: loadedViewName,
                    newViewName: name
                });
            }

        },

        delete: function ($clicked, event) {

            if (confirm("Are you sure?")) {
                ns.sendToServer("delete", { viewName: $clicked.closest("tr").data("name") });
            }

        },

        open: function ($clicked) {

            doOpen();

        },

        close: function ($clicked) {

            if (confirm("Are you sure?")) {
                doClose();
            }

        }

    };


    ns.clear = function () {

        ns.$contentTarget.empty();
        loadedViewName = null;

    };

    ns.load = function (viewName) {

        ns.clear();

        ns.sendToServer("load", {
            viewName: viewName
        });

    };

    function doOpen() {

        let loadedFieldsDict = featureSlip.utilities.fieldList.toDict(loadedFields);

        let scale = loadedFieldsDict.scale / 100;

        let graceMargin = loadedFieldsDict.graceMargin;

        let showsTwo = loadedFieldsDict.showMask && loadedFieldsDict.showMasked;

        let verticalWhenBothMaskAndMasked = loadedFieldsDict.verticalWhenBothMaskAndMasked;

        let width = Math.ceil(scale * (loadedFieldsDict.viewerWidth + graceMargin * 2)) * (showsTwo && !verticalWhenBothMaskAndMasked ? 2 : 1);
        let height = Math.ceil(scale * (loadedFieldsDict.viewerHeight + graceMargin * 2)) * (showsTwo && verticalWhenBothMaskAndMasked ? 2 : 1);

        window.open("viewer.html?viewName=" + encodeURIComponent(loadedViewName), Math.random(), "width=" + width + ",height=" + height + ",menubar=0,toolbar=0,location=0,personalbar=0,status=0,resizable=0,scrollbars=0,dialog=1,titlebar=0,directories=0");

    }

    return ns;

}());