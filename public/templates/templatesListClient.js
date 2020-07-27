window.featureSlip.templates = window.featureSlip.templates || {};

window.featureSlip.templates.list = (function () {

    let ns = featureSlip.common.initDefNs("templatesList"),
        all = [],
        selectedTemplateName;

        const userType = window.featureSlip.userType;
        const userTypesToNumber = window.featureSlip.userTypesToNumber;
        const addIsAllowed = userTypesToNumber.admin == userType;
            
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

            let name = $clicked.data("name");

            select(name);

            featureSlip.templates.editor.load(name, true);
            
        },

        add: function ($clicked, event) {

            let templateName = prompt("Give me a Name");

            ns.sendToServer("add", { templateName: templateName });

        }

    };


    function redraw() {

        ns.$root.html(featureSlip.common.handlebarTemplates.selectList.get$Dom({
            all: all.map(function (templateName) {
                return {
                    name: templateName,
                    selected: templateName == selectedTemplateName
                }
            }),
            allowAdd: addIsAllowed
        }));

    }


    function select(templateName) {
        selectedTemplateName = templateName;

        redraw();

    }

    return ns;

}());