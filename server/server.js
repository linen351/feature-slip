let WebSocketServer = require('websocket').server;
let http = require('http');
let url = require('url');
let fs = require('fs');
//let compileSass = require('./../public/thirdparty/sass/sass.sync');
let compileSass = require('./../public/thirdparty/sass/sass.node');

const port = 1337;

let handlersByKey = {},
  allHandlers = [
    // require('./osc/oscServer.js'),
    require('./viewer/viewsListServer.js'),
    require('./viewer/viewsEditorServer.js'),
    require('./templates/templatesListServer.js'),
    require('./templates/templatesEditorServer.js'),
    require('./instances/instancesListServer.js'),
    require('./instances/instancesEditorServer.js'),
    require('./player/playerControlServer.js'),
    require('./player/playlistsListServer.js'),
    require('./player/playlistsEditorServer.js'),
    require('./viewer/viewerServer.js')
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
  otf: "font/opentype"
};

const allUserTypes = [
  "watcher",
  "editor",
  "runner",
  "viewadmin",
  "admin"
];

function someAsyncFunc() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: 1 });
    }, 1000);
  });
}


let server = http.createServer();

server.on('request', (request, response) => {

  let q = url.parse(request.url, true),
    path = q.pathname,
    pathSplit = path.split("/");

  if (allUserTypes.includes(pathSplit[1])) {
    if (pathSplit.length == 2) {
      pathSplit[1] = '';
    } else {
      pathSplit.splice(1, 1);
    }
  }

  if (pathSplit.length == 2 && pathSplit[1].length == 0) {
    pathSplit[1] = 'index.html';
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

    path = '../public' + path;

    if (fileEnding) {

      if (fileEnding == "css" && !fs.existsSync(path)) {

        path = path.substring(0, path.length - 3) + "scss";

        var options = {
          style: compileSass.Sass.style.expanded,
        };

        compileSass(path, options, function (result) {
          fileData = result.text;

          response.writeHead(200, { 'Content-Type': mimeType });
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

  response.writeHead(200, { 'Content-Type': mimeType });
  response.write(fileData);
  response.end();

});



server.listen(port, function () {

  allHandlers.forEach(function (handler) {
    handlersByKey[handler.key] = handler;

    if (handler.init) {
      handler.init();
    }
  });

});

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

console.log("Server start, port " + port);

// WebSocket server
wsServer.on('request', function (request) {

  let connection = request.accept(null, request.origin);

  clients.push(connection);

  allHandlers.forEach(function (handler) {
    if (handler.connected) {
      handler.connected();
    }
  });


  connection.on('message', function (message) {

    if (message.type === 'utf8') {

      let json = JSON.parse(message.utf8Data);

      let data = json.data;

      console.log("message from ", data);

      let handler = handlersByKey[json.handler];

      handler.actions[data.action](data.data);

    }

  });

  connection.on('close', function () {

    let index = clients.indexOf(connection);

    console.log("remove client ", index);

    clients.splice(index, 1);

  });

});


function sendToAllClients(handler, data) {

  let stringed = JSON.stringify({ handler: handler.key, data: data });

  //console.trace("Send to", clients.length);
  clients.forEach(function (client) {
    client.send(stringed);
  });

}


ggs = {
  sendToAllClients: sendToAllClients
};