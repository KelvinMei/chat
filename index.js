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
  console.log("number of connections: " + connections.length);

  //disconnect
  socket.on("disconnect", function(data) {
    //user
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();

    //connection
    connections.splice(connections.indexOf(socket.id), 1);
    console.log("number of connections: " + connections.length);

    var object = {
      name: socket.username,
      message: " has left the chat.",
      time: "",
      color: socket.color,
      strong: false
    };

    listOfMessages.push(object);
    io.emit("new message", object);
  });

  //send message
  socket.on("send message", function(msg) {
    if (
      msg.startsWith("/nick ") &&
      !users.includes(msg.substring(6, msg.length))
    ) {
      users.splice(users.indexOf(socket.username), 1);

      var object = {
        name: socket.username,
        message: " has changed their name to " + msg.substring(6, msg.length),
        time: "",
        color: socket.color,
        strong: false
      };
      socket.username = msg.substring(6, msg.length);
      users.push(socket.username);
      updateUsername(socket.username);
      updateUsernames();
      listOfMessages.push(object);
      io.emit("new message", object);
    } else if (msg.startsWith("/nickcolor ")) {
      socket.color = msg.substring(11, msg.length);

      var object = {
        name: socket.username,
        message: " has changed their color to " + socket.color,
        time: "",
        color: socket.color,
        strong: false
      };
      listOfMessages.push(object);
      io.emit("new message", object);
    } else {
      const date = new Date();
      var hr = date.getHours();
      var min = date.getMinutes();
      if (min < 10) {
        min = "0" + min;
      }
      var time = hr + ":" + min + " ";

      var object = {
        name: socket.username,
        message: ": " + msg,
        time: time,
        color: socket.color,
        strong: false
      };

      listOfMessages.push(object);
      socket.broadcast.emit("new message", object);

      object.strong = true;
      io.sockets.connected[socket.id].emit("new message", object);
    }
  });

  //new user
  socket.on("new users", function() {
    do {
      socket.username = "User" + Math.floor(Math.random() * 10);
    } while (users.includes(socket.username));

    socket.color = "000000";

    users.push(socket.username);
    updateUsername(socket.username);
    updateUsernames();

    var object = {
      name: socket.username,
      message: " has joined the chat.",
      time: "",
      color: socket.color,
      strong: false
    };

    listOfMessages.push(object);
    io.emit("new message", object);
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
    io.sockets.connected[socket.id].emit("get message", listOfMessages);
  });
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});
