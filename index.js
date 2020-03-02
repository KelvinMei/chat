var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    const date = new Date();
    var hr = date.getHours();
    var min = date.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var time = hr + ":" + min;

    io.emit('chat message', time + " " + msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
