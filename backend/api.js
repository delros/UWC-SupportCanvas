var port = 8001
  , static = require('node-static')
  , file = new(static.Server)(__dirname + '/public');

var app = require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  });
});

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  socket.on('message', function (message) {
    console.log(message);
    socket.emit('message', message);
    socket.broadcast.emit('message', message);
  });
  socket.on('share', function (data) {
    console.log(data);
    socket.emit('share', data);
    socket.broadcast.emit('share', data); 
  });
});

app.listen(port);