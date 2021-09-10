"use strict";
exports.__esModule = true;
exports.sendToAllClients = void 0;
var websocket_1 = require("websocket");
var http = require("http");
var url = require("url");
var fs = require("fs");
var compileSass = require("../public/thirdparty/sass/sass.node");
var viewListServerHandler = require("./viewer/viewsListServer");
var viewsEditorServerHandler = require("./viewer/viewsEditorServer");
var templatesListServerHandler = require("./templates/templatesListServer");
var templatesEditorServerHandler = require("./templates/templatesEditorServer");
var instancesListServerHandler = require("./instances/instancesListServer");
var instancesEditorServerHandler = require("./instances/instancesEditorServer");
var playerControlServerHandler = require("./player/playerControlServer");
var playlistsListServerHandler = require("./player/playlistsListServer");
var playlistsEditorServerHandler = require("./player/playlistsEditorServer");
var viewerServerHandler = require("./viewer/viewerServer");
var port = 1337;
var handlersByKey = {}, allHandlers = [
    // require('./osc/oscServer.js'),
    viewListServerHandler,
    viewsEditorServerHandler,
    templatesListServerHandler,
    templatesEditorServerHandler,
    instancesListServerHandler,
    instancesEditorServerHandler,
    playerControlServerHandler,
    playlistsListServerHandler,
    playlistsEditorServerHandler,
    viewerServerHandler,
];
var clients = [];
var mimeTypes = {
    html: "text/html",
    css: "text/css",
    scss: "text/css",
    js: "text/javascript",
    json: "application/json",
    jpg: "image/jpg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    woff: "application/font-woff",
    woff2: "font/woff2",
    eot: "application/vnd.ms-fontobject",
    svg: "image/svg+xml",
    ttf: "application/octet-stream",
    otf: "font/opentype"
};
var allUserTypes = ["watcher", "editor", "runner", "viewadmin", "admin"];
function someAsyncFunc() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve({ data: 1 });
        }, 1000);
    });
}
var server = http.createServer();
server.on("request", function (request, response) {
    var q = url.parse(request.url, true), path = q.pathname, pathSplit = path.split("/");
    if (allUserTypes.includes(pathSplit[1])) {
        if (pathSplit.length == 2) {
            pathSplit[1] = "";
        }
        else {
            pathSplit.splice(1, 1);
        }
    }
    if (pathSplit.length == 2 && pathSplit[1].length == 0) {
        pathSplit[1] = "index.html";
    }
    var fileData = null;
    var handler = handlersByKey[pathSplit[1]];
    if (handler && handler.getFileData) {
        fileData = handler.getFileData(pathSplit.slice(2));
    }
    path = pathSplit.join("/");
    path = decodeURIComponent(path);
    var lastIndexOfDot = path.lastIndexOf(".");
    var fileEnding;
    if (lastIndexOfDot == -1) {
        fileEnding = null;
    }
    else {
        fileEnding = path.substring(lastIndexOfDot + 1);
    }
    var mimeType;
    if (fileEnding) {
        mimeType = mimeTypes[fileEnding];
        if (!mimeType) {
            response.writeHead(500);
            response.end();
            return;
        }
    }
    else {
        mimeType = mimeTypes.json;
    }
    if (fileData === null) {
        path = "../public" + path;
        if (fileEnding) {
            if (fileEnding == "css" && !fs.existsSync(path)) {
                path = path.substring(0, path.length - 3) + "scss";
                var options = {
                    style: compileSass.Sass.style.expanded
                };
                compileSass(path, options, function (result) {
                    fileData = result.text;
                    response.writeHead(200, { "Content-Type": mimeType });
                    response.write(fileData);
                    response.end();
                });
                return;
            }
            else {
                if (fs.existsSync(path)) {
                    fileData = fs.readFileSync(path);
                }
            }
        }
        else {
            if (fs.existsSync(path)) {
                if (fs.lstatSync(path).isDirectory()) {
                    fileData = JSON.stringify(fs.readdirSync(path));
                }
            }
            else {
                fileData = "[]";
            }
        }
    }
    if (!fileData) {
        response.writeHead(500);
        response.end();
        return;
    }
    response.writeHead(200, { "Content-Type": mimeType });
    response.write(fileData);
    response.end();
});
server.listen(port, function () {
    allHandlers.forEach(function (handler) {
        handlersByKey[handler.key] = handler;
        if ("init" in handler) {
            handler.init();
        }
    });
});
// create the server
var wsServer = new websocket_1.server({
    httpServer: server
});
console.log("Server start, port " + port);
// WebSocket server
wsServer.on("request", function (request) {
    var connection = request.accept(null, request.origin);
    clients.push(connection);
    allHandlers.forEach(function (handler) {
        if ("connected" in handler) {
            handler.connected();
        }
    });
    connection.on("message", function (message) {
        if (message.type === "utf8") {
            var json = JSON.parse(message.utf8Data);
            var data = json.data;
            console.log("message from ", data);
            var handler = handlersByKey[json.handler];
            handler.actions[data.action](data.data);
        }
    });
    connection.on("close", function () {
        var index = clients.indexOf(connection);
        console.log("remove client ", index);
        clients.splice(index, 1);
    });
});
function sendToAllClients(handler, data) {
    var stringed = JSON.stringify({ handler: handler.key, data: data });
    //console.trace("Send to", clients.length);
    clients.forEach(function (client) {
        client.send(stringed);
    });
}
exports.sendToAllClients = sendToAllClients;
