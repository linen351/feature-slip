window.featureSlip.instances = window.featureSlip.instances || {};

window.featureSlip.instances.list = (function () {

    let ns = featureSlip.common.initDefNs("instancesList"),
        all = [],
        selectedTemplateName,
        selectedInstanceName;

    const userType = window.featureSlip.userType;
    const userTypesToNumber = window.featureSlip.userTypesToNumber;
    const addIsAllowed = userTypesToNumber.editor == userType || userTypesToNumber.admin == userType;

    ns.init = function () {

    };

    ns.incomingHandlers = {

        warning: function (data) {
            alert(data);
        },

        all: function (data) {

            all = data;
            redrawList();

        }

    };

    ns.clickHandlers = {

        item: function ($clicked, event) {

            select($clicked.data("name"));

        },

        add: function ($clicked, event) {

            let name = prompt("Give me a Name");

            ns.sendToServer("add", { templateName: selectedTemplateName, instanceName: name });

        },

        edit: function ($clicked, event) {

            let name = $clicked.closest(".item").data("name");

            select(name);

            featureSlip.instances.editor.load(selectedTemplateName, [name]);


        },

        rename: function ($clicked, event) {

            let oldInstanceName = $clicked.closest(".item").data("name");
            let name = prompt("Give me a new Name", oldInstanceName);

            if (name) {

                ns.sendToServer("rename", {
                    templateName: selectedTemplateName,
                    oldInstanceName: oldInstanceName,
                    newInstanceName: name
                });

            }

        },

        delete: function ($clicked, event) {

            if (confirm("Are you sure?")) {
                ns.sendToServer("delete", {
                    templateName: selectedTemplateName,
                    instanceName: $clicked.closest(".item").data("name")
                });
            }

        }

    };


    ns.selectTemplate = function (name) {

        selectedInstanceName = null;
        selectedTemplateName = name;

        ns.sendToServer("getAll", {
            templateName: selectedTemplateName
        });
    };


    function redrawList() {

        ns.$contentTarget.html(featureSlip.common.handlebarTemplates.selectList.get$Dom({
            all: all.map(function (instanceName) {
                return {
                    name: instanceName,
                    selected: instanceName == selectedInstanceName
                }
            }),
            allowAdd: addIsAllowed
        }));

    }

    function select(instanceName) {

        featureSlip.instances.editor.clear();

        selectedInstanceName = instanceName;
        redrawList();
    }

    return ns;

}());