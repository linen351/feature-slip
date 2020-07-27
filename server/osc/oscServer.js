//let osc = require("osc");
let common = require('../commonServer.js');
let systemSettingsCommon = require('../systemSettings/systemSettingsCommon.js');
let viewer = require('../viewer/viewerServer.js');
let playerControl = require('../player/playerControlServer.js');
let utilities = require('../../public/utilities/utilities.js');

let fs = require('fs');
let that = this;


exports.key = "osc";

const oscSettingsPath = '../public/data/oscSettings.json';

let commandsByAddress = {},
    connectedStatusByAddress = {},
    latestConnectedAddress;

let port;

let oscSettings;

function getOscSettings() {

    let systemSettings = systemSettingsCommon.getSystemSettings();

    let oscFieldsMould = systemSettings.oscFieldsMould;

    let storedSettings = fs.existsSync(oscSettingsPath) ? JSON.parse(fs.readFileSync(oscSettingsPath, common.fileEncoding)) : {};

    return common.applyFieldDefaults(storedSettings, oscFieldsMould);

}

function saveOscSettings(settings) {

    fs.writeFileSync(oscSettingsPath, JSON.stringify(settings), common.fileEncoding);

}



let actions = exports.actions = {

    message: function (inData) {
        port.send(inData);
    },

    load: function () {

        common.sendToAllClients.call(that, "loaded", oscSettings);

    },

    save: function (settings) {

        saveOscSettings(settings);

        refreshPort();

        actions.load();

    }

};

function incomingName(addressSegments, args) {

    let name = Buffer.from(args[0], 'ascii').toString('UTF-8');

    if (name) {

        let commandSegments = name.split('/');

        if (commandSegments[1] == "fs") {

            commandsByAddress[addressSegments.join("/")] = commandSegments.slice(2);

        }

    }

}

function incomingConnected(addressSegments, args) {

    //Plenty of debouncing

    let playStatus = args[0],
        address = addressSegments.join("/");

    if (connectedStatusByAddress[address] != playStatus) {

        connectedStatusByAddress[address] = playStatus;

        if (playStatus === 3) {

            if (latestConnectedAddress != address) {

                latestConnectedAddress = address;

                let commandSegments = commandsByAddress[address];

                if (commandSegments) {

                    parseCommand(commandSegments);

                }

            }

        }

    }


}

function parseCommand(commandSegments, viewerCommandAggregated) {

    viewerCommandAggregated = viewerCommandAggregated || {};

    // console.log(commandPath, commandAggregated);

    switch (commandSegments[0].toLowerCase()) {
        case "t":
            viewerCommandAggregated.templateName = commandSegments[1];
            commandSegments = commandSegments.slice(2);
            break;
        case "i":
            viewerCommandAggregated.instanceName = commandSegments[1];
            commandSegments = commandSegments.slice(2);
            break;
        case "v":
            viewerCommandAggregated.viewName = commandSegments[1];
            commandSegments = commandSegments.slice(2);
            break;
        case "startin":
        console.log("startin");
            viewer.startIn(viewerCommandAggregated);
            commandSegments = commandSegments.slice(1);
            break;
        case "startout":
        console.log("startout");
        
            viewer.startOut(viewerCommandAggregated);
            commandSegments = commandSegments.slice(1);
            break;
        case "next":
        console.log("next");
        
            playerControl.actions.navigatePlaylistNext();
            commandSegments = commandSegments.slice(1);
            break;
        case "prev":
        console.log("prev");
        
            playerControl.actions.navigatePlaylistPrev();
            commandSegments = commandSegments.slice(1);
            break;
        default:
            commandSegments = commandSegments.slice(1);
            break;

    }

    if (0 < commandSegments.length) {
        parseCommand(commandSegments, viewerCommandAggregated);
    } else {
        return;
    }

}

function refreshPort() {

    return;

    if (port) {
        port.close();
        port = null;
    }

    commandsByAddress = {};
    connectedStatusByAddress = {};

    oscSettings = getOscSettings();

    let easilyAccessiblySettings = utilities.fieldList.toDict(oscSettings);

    if (easilyAccessiblySettings.active) {

        port = new osc.UDPPort({
            localAddress: easilyAccessiblySettings.address,
            localPort: easilyAccessiblySettings.incomingPort,
            remotePort: easilyAccessiblySettings.outgoingPort
        });

        port.on("ready", function () {
            console.log("Listening for incoming OSC over UDP.");

            port.send({
                address: "/composition/layers/*/clips/*/name",
                args: ["?"]
            });

            port.send({
                address: "/composition/layers/*/name",
                args: ["?"]
            });

        });

        port.on("message", function (oscMsg) {

            let addressSegments = oscMsg.address.split("/"),
                lastAddressSegment = addressSegments[addressSegments.length - 1],
                allButLastAddressSegments = addressSegments.slice(0, -1);

            if (lastAddressSegment != "position" && !allButLastAddressSegments.includes("selectedclip")) {

                let args = oscMsg.args;

                switch (lastAddressSegment) {

                    case "connected":

                        incomingConnected(allButLastAddressSegments, args);
                        break;

                    case "name":

                        incomingName(allButLastAddressSegments, args);
                        break;


                }

            }

        });

        port.open();

    }

}

exports.init = function () {

    refreshPort();

};