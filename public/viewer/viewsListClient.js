window.featureSlip.systemSettings = window.featureSlip.systemSettings || {};

window.featureSlip.systemSettings.views = window.featureSlip.systemSettings.views || {};

window.featureSlip.systemSettings.views.list = (function () {

    let ns = featureSlip.common.initDefNs("viewsList"),
        all = [],
        selectedViewName;

    const userType = window.featureSlip.userType;
    const userTypesToNumber = window.featureSlip.userTypesToNumber;
    const addIsAllowed = userTypesToNumber.viewadmin == userType || userTypesToNumber.admin == userType;

    ns.init = function () {

        console.log("get all views");
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

            featureSlip.systemSettings.views.editor.load(name);

        },

        add: function ($clicked, event) {

            let viewName = prompt("Give me a Name");

            ns.sendToServer("add", { viewName: viewName });

        }

    };


    function redraw() {

        ns.$root.html(featureSlip.common.handlebarTemplates.selectList.get$Dom({
            all: all.map(function (viewName) {
                return {
                    name: viewName,
                    selected: viewName == selectedViewName
                }
            }),
            allowAdd: addIsAllowed
        }));

    }


    function select(viewName) {
        selectedViewName = viewName;

        redraw();

        featureSlip.systemSettings.views.editor.load(selectedViewName);

    }

    return ns;

}());