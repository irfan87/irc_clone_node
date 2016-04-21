var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

// all cached files will be store as an array
var cache = {};

// Node doesn't care where you put the server variable but to be more readable and consise, just put before function send404()
var server = http.createServer(function(request, response){
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }

  // serve static file
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);

// 404-error helper
// it will send a 404 page if the page / file is not found
function send404(response){
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: Resource not found');
  response.end();
}

// the file will send to the browser if the file is found
function sendFile(response, filePath, fileContents){
  response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

// serving static files
function serveStatic(response, cache, absPath){
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    fs.exists(absPath, function(exists){
      if (exists) {
        fs.readFile(absPath, function(err, data){
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}

server.listen(3000);
console.log('Node is listening to port 3000');
