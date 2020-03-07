var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

var connections = [];
var users = [];
var listOfMessages = [];

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  connections.push(socket.id);

  //disconnect
  socket.on("disconnect", function(data) {
    //user
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();

    //connection
    connections.splice(connections.indexOf(socket.id), 1);
  });

  //send message
  socket.on("send message", function(msg) {
    if (
      msg.startsWith("/nick ") &&
      !users.includes(msg.substring(6, msg.length))
    ) {
      users.splice(users.indexOf(socket.username), 1);

      socket.username = msg.substring(6, msg.length);
      users.push(socket.username);
      updateUsername(socket.username);
      updateUsernames();
    } /* else if (msg.startsWith("/nickcolor ")) {

      socket.username = socket.username.fontcolor(
        msg.substring(11, msg.length)
      );
    }*/ else {
      const date = new Date();
      var hr = date.getHours();
      var min = date.getMinutes();
      if (min < 10) {
        min = "0" + min;
      }
      var time = hr + ":" + min;

      msg = time + " " + socket.username + ": " + msg;

      listOfMessages.push(msg);
      io.emit("new message", msg);
    }
  });

  //new user
  socket.on("new users", function() {
    do {
      socket.username = "User" + Math.floor(Math.random() * 10);
    } while (users.includes(socket.username));

    users.push(socket.username);
    updateUsername(socket.username);
    updateUsernames();
  });

  //update username list
  function updateUsernames() {
    io.emit("get users", users);
  }

  function updateUsername(name) {
    io.sockets.connected[socket.id].emit("username", name);
  }

  //new user
  socket.on("get message", function() {
    io.emit("get message", listOfMessages);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
