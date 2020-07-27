window.featureSlip.systemSettings = window.featureSlip.systemSettings || {};

window.featureSlip.systemSettings.mainMenu = (function () {

    let ns = featureSlip.common.initDefNs("mainMenu");

    ns.init = function () {}

    ns.incomingHandlers = {};

    ns.clickHandlers = {

        osc: function() {
            featureSlip.osc.load();
        },

        playerControl: function() {
            featureSlip.player.control.load();
        }

    };

    return ns;

}());