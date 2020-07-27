window.featureSlip.osc = (function () {

    let ns = featureSlip.common.initDefNs("osc"),
        $messageArea,
        $fieldEditor;

    ns.init = function () {

        let $root = ns.$root;
        $messageArea = $root.find("textarea");

        $fieldEditor = ns.$contentTarget;


        ns.sendToServer("load");

    }

    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        loaded: function(settings) {

            $fieldEditor.html(featureSlip.common.handlebarTemplates.singleFieldsTable.get$Dom({
                fields: settings
            }));

        },

        message: function() {

        }

    };

    ns.clickHandlers = {

        save: function() {

            ns.sendToServer("save", featureSlip.common.handlebarTemplates.singleFieldsTable.getJson($fieldEditor));

        },

        send: function() {

            ns.sendToServer("message", JSON.parse($messageArea.val()));
        }

    };


    ns.clear = function () {

        ns.$contentTarget.empty();
        loadedViewName = null;

    };

    ns.load = function () {

        // ns.showMain.call(ns);

    };

    return ns;

}());