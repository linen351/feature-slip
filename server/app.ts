import { server as WebSocketServer } from "websocket";
import * as http from "http";
import * as url from "url";
import * as fs from "fs";
import * as compileSass from "../public/thirdparty/sass/sass.node";

import * as viewListServerHandler from "./viewer/viewsListServer";
import * as viewsEditorServerHandler from "./viewer/viewsEditorServer";
import * as templatesListServerHandler from "./templates/templatesListServer";
import * as templatesEditorServerHandler from "./templates/templatesEditorServer";
import * as instancesListServerHandler from "./instances/instancesListServer";
import * as instancesEditorServerHandler from "./instances/instancesEditorServer";
import * as playerControlServerHandler from "./player/playerControlServer";
import * as playlistsListServerHandler from "./player/playlistsListServer";
import * as playlistsEditorServerHandler from "./player/playlistsEditorServer";
import * as viewerServerHandler from "./viewer/viewerServer";

const port = 1337;

let handlersByKey = {},
  allHandlers = [
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

let clients = [];

const mimeTypes = {
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
  otf: "font/opentype",
};

const allUserTypes = ["watcher", "editor", "runner", "viewadmin", "admin"];

function someAsyncFunc() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 1 });
    }, 1000);
  });
}

let server = http.createServer();

server.on("request", (request, response) => {
  let q = url.parse(request.url, true),
    path = q.pathname,
    pathSplit = path.split("/");

  if (allUserTypes.includes(pathSplit[1])) {
    if (pathSplit.length == 2) {
      pathSplit[1] = "";
    } else {
      pathSplit.splice(1, 1);
    }
  }

  if (pathSplit.length == 2 && pathSplit[1].length == 0) {
    pathSplit[1] = "index.html";
  }

  let fileData = null;
  let handler = handlersByKey[pathSplit[1]];
  if (handler && handler.getFileData) {
    fileData = handler.getFileData(pathSplit.slice(2));
  }

  path = pathSplit.join("/");

  path = decodeURIComponent(path);

  let lastIndexOfDot = path.lastIndexOf(".");
  let fileEnding;

  if (lastIndexOfDot == -1) {
    fileEnding = null;
  } else {
    fileEnding = path.substring(lastIndexOfDot + 1);
  }

  let mimeType;

  if (fileEnding) {
    mimeType = mimeTypes[fileEnding];

    if (!mimeType) {
      response.writeHead(500);
      response.end();
      return;
    }
  } else {
    mimeType = mimeTypes.json;
  }

  if (fileData === null) {
    path = "../public" + path;

    if (fileEnding) {
      if (fileEnding == "css" && !fs.existsSync(path)) {
        path = path.substring(0, path.length - 3) + "scss";

        var options = {
          style: compileSass.Sass.style.expanded,
        };

        compileSass(path, options, function (result) {
          fileData = result.text;

          response.writeHead(200, { "Content-Type": mimeType });
          response.write(fileData);
          response.end();
        });

        return;
      } else {
        if (fs.existsSync(path)) {
          fileData = fs.readFileSync(path);
        }
      }
    } else {
      if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
          fileData = JSON.stringify(fs.readdirSync(path));
        }
      } else {
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
const wsServer = new WebSocketServer({
  httpServer: server,
});

console.log("Server start, port " + port);

// WebSocket server
wsServer.on("request", function (request) {
  let connection = request.accept(null, request.origin);

  clients.push(connection);

  allHandlers.forEach(function (handler) {
    if ("connected" in handler) {
      handler.connected();
    }
  });

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      let json = JSON.parse(message.utf8Data);

      let data = json.data;

      console.log("message from ", data);

      let handler = handlersByKey[json.handler];

      handler.actions[data.action](data.data);
    }
  });

  connection.on("close", function () {
    let index = clients.indexOf(connection);

    console.log("remove client ", index);

    clients.splice(index, 1);
  });
});

export function sendToAllClients(handler, data) {
  let stringed = JSON.stringify({ handler: handler.key, data: data });

  //console.trace("Send to", clients.length);
  clients.forEach(function (client) {
    client.send(stringed);
  });
}
