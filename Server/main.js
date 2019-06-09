const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 42124 });
 
var channels = [];
var connections = [];
 
wss.on('connection', function connection(ws) {
  ws.lastPing = Date.now()
  ws.sendDirect = (type, data) => {
    try {
      console.log("S --> C", {
        "type": type,
        "data": data
      })
      ws.send(JSON.stringify({
        "type": type,
        "data": data
      }))
    } catch(err) {
      
    }
  }
  
  ws.on('message', function incoming(message) {
    try {
      var data = JSON.parse(message)
      console.log("C --> S", data.type)
      //create channel:
      if(data.type == "createChannel") {
        channels.push({
          "users": [],
          "owner": ws,
          "state": {},
          "token": data.channelToken
        })
        ws.channel = channels[channels.length - 1]
      }
      if(data.type == "joinChannel") {
        destroyChannel(ws);
        var targetChannel = "NOT FOUND";
        for(var i = 0; i < channels.length; i++) {
          if(channels[i].token == data.channelToken) {
            targetChannel = channels[i]
          }
        }
        if(targetChannel != "NOT FOUND") {
          ws.channel = targetChannel
          ws.channel.users.push(ws)
          ws.sendDirect("CHANNEL_STATE", {"SONG": ws.channel.state})
        } else {
          ws.sendDirect("ERROR", "CHANNEL NOT FOUND")
        }
      }
      if(data.type == "UPDATE_ACCOUNT") {
        ws.account = data.content.data
      } else {
        if(data.content) {
          if(ws.channel.owner == ws) {
            ws.channel.users.forEach(socket => {
              socket.sendDirect(data.content.event, data.content.data)
            })
          }
        }
      }
      if(["LOADING", "PLAY", "PAUSE", "SONG_CHANGE", "SCRUB_TO"].indexOf(data.type) != -1) {
        ws.channel.state = data.content.data
        ws.channel.state.lastUpdate = Date.now();
        console.log("UPDATED_STATE")
      }
      if(data.type == "PONG") {
        ws.lastPing = Date.now();
      }
      if(data.type == "USER_DATA_REQUEST") {
        var users = [];
        users.push({
          "acc": ws.channel.owner.account,
          "own": true
        })
        ws.channel.users.forEach(user => {
          users.push({
            "acc": user.account,
            "own": false
          })
        })
        ws.sendDirect("USER_DATA", users)
      }
      
    
    } catch(err) {
      ws.sendDirect("ERROR", err)
    }
  });
  connections.push(ws)
  
  ws.on("error", () => {
    ws.sendDirect("ERROR")
  })
  
  ws.on('close', () => {
    closeSocket(ws)
  })
});

var destroyChannel = (ws) => {
  if(ws.channel) {
    if(ws.channel.owner == ws) {
      // TODO: DELETE CHANNEL
      ws.channel.users.forEach(socket => {
        socket.sendDirect("DEAD_CHANNEL")
      })
      channels.splice(channels.indexOf(ws.channel),1)
      delete ws.channel;
    } else {
      ws.channel.users.splice(ws.channel.users.indexOf(ws),1)
      delete ws.channel;
      return;
    }
  } else {
    return;
  }
}

var closeSocket = (ws) => {
  destroyChannel(ws)
  ws.terminate()
  connections.splice(connections.indexOf(ws),1)
}

setInterval(() => {
  connections.forEach(ws => {
    ws.sendDirect("PING", Date.now())
    if(Date.now() - ws.lastPing > 10000) {
      closeSocket(ws)
    }
  })
}, 1000)