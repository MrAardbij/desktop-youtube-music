var net = require('net');
const EventEmitter = require('events');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync("./config.JSON", "utf-8"))
const emitter = new EventEmitter();
var server = net.createServer();
const uuidv1 = require('uuid/v1');

server.listen(config['port'], config['host'], () => {
  emitter.emit('OPEN', config['port'])
});

var sockets = []

server.on('connection', function(sock) {
  sock.UUID = uuidv1(); // give our socket a UUID so we don't have to pass the entire socket other than on creation
  sock.lastPingAt = Date.now(); // so that when our ping kicker checks this socket it's last ping isnt years in the past
  sockets.push(sock) // allow our ping kicker to itterate over each socket.
  emitter.emit("CONNECTION", sock)
  sock.on('data', function(data) {
    try {
      var parsedData = JSON.parse(data.toString('utf-8')) // convert raw bytes to a UTF-8 String, then parse it.
      if(String(parsedData['type']) == "0,2") { // check if the message is a ping
        sock.write(JSON.stringify({"serverTime": Date.now(), 'type': [0,2]})); // reply with our current time
        sock.lastPingAt = Date.now(); // update last ping
      } else {
        emitter.emit("DATA", sock.UUID, parsedData)
      }
    } catch(err) {
      emitter.emit("ERROR", err)
    }
  });
  sock.on("close", () => {
    killsocket(sock, "Remote Disconnect")
  })
  sock.on("error", () => {
    killsocket(sock, "ERROR")
  })
});

var killsocket = (sock, reason) => {
  emitter.emit("CLOSE", sock.UUID, reason)
  sock.destroy();
  var index = sockets.indexOf(sock);
  if (index > -1) {
    sockets.splice(index, 1);
  }
}

setInterval(() => {
  sockets.forEach(socket => {
    if(Date.now() - socket.lastPingAt > config['timeout']) {
      killsocket(socket, "Timeout")
    }
  })
}, 1000)

module.exports = emitter