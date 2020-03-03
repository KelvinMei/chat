var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

var connections = [];
var users = [];

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  connections.push(socket.id);
  console.log("number of connections: " + connections.length);
  console.log(connections);

  //disconnect
  socket.on("disconnect", function(data) {
    //user
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();

    //connection
    connections.splice(connections.indexOf(socket.id), 1);
    console.log("number of users/connections: " + connections.length);
  });

  //send message
  socket.on("send message", function(msg) {
    const date = new Date();
    var hr = date.getHours();
    var min = date.getMinutes();
    if (min < 10) {
      min = "0" + min;
    }
    var time = hr + ":" + min;

    msg = time + " " + socket.username + ": " + msg;

    io.emit("new message", msg);
  });

  //new user
  socket.on("new users", function(name) {
    socket.username = name;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    console.log(users);
    io.emit("get users", users);
  }
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
