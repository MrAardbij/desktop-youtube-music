//  JS_GzDglSJhzzKpHRShBkpikkn529QBJHE7
const { app, BrowserWindow, session, ipcMain } = require('electron')
const ipc = ipcMain
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
let win
var globalData = {};
globalData.network = {
  "enabled": false
}
globalData.connectedUsers = [];
const notifier = require('node-notifier');
var d_rpc = require('./DiscordRPCHandler.js');
const settingsModule = require('./settingsModule.js');
const connectionsModule = require('./connectionsModule.js');
const WebSocket = require('ws');
var client = d_rpc('582505724693839882');
var discord = d_rpc.emitter
const path = require('path');
const request = require('request');
const randomstring = require('randomstring');
globalData.partyId = "PI_" + randomstring.generate()
globalData.joinSecret = "JS_" + randomstring.generate()
console.log(globalData.joinSecret)
const fs = require('fs');
client.on('ready', () => {
  var discordPresence = {};
  discordPresence.details = "On Homepage";
  discordPresence.largeImageKey = "listening";
  discordPresence.smallImageKey = "loading";
  discordPresence.smallImageText = "N/A";
  client.setActivity(discordPresence)
})
discord.on('DISPATCH', (data => {
  globalData.discordUser = data.user
}))
client.on('join', (secret) => {
  joinSever(secret)
})
function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + "/preloadInjection.js",
      webSecurity: false // we have to do this to be able to inject our modfied polymer. IF ANYONE HAS A BETTER WAY TO DO THIS. SEND A REQUEST!!!
    },
    frame: false,
    backgroundColor: "#000",
    icon: __dirname + '/YouTube_Music_Icon.png'
  })
  win.loadURL('https://music.youtube.com/')
  win.on('closed', () => {
    win = null
  })
  globalData.window = win;
  
  //intercept requests for youtube's music_polymer.js file
  //and replace it with our own
  const filter = {
    urls: ['*://music.youtube.com/s/music/*/music_polymer*.js']
  }
  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    if(details.url.split("/")[details.url.split("/").length - 1] == "music_polymer_v2.js") {
      //console.log("NEW", details.url.split("/")[details.url.split("/").length - 1])
      callback({ redirectURL: "file://" + __dirname + "/modified_polymer.js" })
    } else {
      //console.log("OLD", details.url.split("/")[details.url.split("/").length - 1])
      callback({ redirectURL: "file://" + __dirname + "/modified_polymer_classic.js" })
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

ipc.on("GET_NETWORK", (_event) => {
  _event.returnValue = (globalData.network)
})

ipc.on("UPDATE_RAW", (event, songObject) => { //FINISHED
  globalData.currentSong = songObject
})

ipc.on("SONG_CHANGE", (event, songObject) => { //FINISHED
  //console.log("SONG_CHANGE", songObject)
  if(!globalData.inFocus) {
    prompt(songObject)
  }
  sendEvent("SONG_CHANGE", songObject)
  updateDiscord();
})

ipc.on("SCRUB_TO", (event, songObject) => { //FINISHED
  //console.log("SCRUB_TO", songObject)
  sendEvent("SCRUB_TO", songObject)
  updateDiscord();
})

ipc.on("PAUSE", (event, songObject) => { //FINISHED
  //console.log("PAUSE", songObject)
  sendEvent("PAUSE", songObject)
  updateDiscord();
})

ipc.on("PLAY", (event, songObject) => { //FINISHED
  //console.log("PLAY", songObject)
  sendEvent("PLAY", songObject)
  updateDiscord();
})

ipc.on("LOADING", (event, songObject) => { //FINISHED
  //console.log("LOADING", songObject)
  sendEvent("LOADING", songObject)
  updateDiscord();
})


ipc.on("FOCUS_CHANGE", (event, inFocus) => { //FINISHED
  //console.log("FOCUS_CHANGE", inFocus)
  globalData.inFocus = inFocus
})

ipc.on("UPDATE_ACCOUNT", async (event, userObject) => { //FINISHED
  //console.log("UPDATE_ACCOUNT", userObject)
  sendEvent("UPDATE_ACCOUNT", [globalData.discordUser, userObject])
  globalData.googleUser = userObject
})

ipc.on("SETTINGS_CLICK", (event) => { //FINISHED
  //console.log("SETTINGS OPENED")
  settingsModule.window.createWindow();
})

ipc.on("CONNECTED_USERS_CLICK", (event) => { //FINISHED
  //console.log("CONNECTED USERS OPENED")
  connectionsModule.window.createWindow();
})


var prompt = (songObject) => {
  var stream = request(songObject.icon.split('=')[0] + "=w240-h240-l90-rj").pipe(fs.createWriteStream(path.join(__dirname, 'TMP_ICON.jpg')))
  var a = [];
  songObject.authors.forEach(author => {
    a.push(author.text)
  })
  //console.log(a)
  var str = a.length == 1 ? a[0] : [ a.slice(0, a.length - 1).join(", "), a[a.length - 1] ].join(" and ")
  stream.on('finish', () => {
    notifier.notify({
      title: 'Playing: ' + songObject.title,
      message: 'By: ' + str,
      icon: path.join(__dirname, 'TMP_ICON.jpg'),
      sound: false
    });
  });
}

globalData.lastUpdate = Date.now();


var syncPause = (ms) => {
  return new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve();
    }, ms)
  });
}


var updateDiscord = async () => {
  await syncPause(100);
  if(Date.now() - globalData.lastUpdate > 1000) {
    var a = [];
    try {
      globalData.currentSong.authors.forEach(author => {
        a.push(author.text)
      })
    } catch(err) {
      a = [];
    }
    //console.log(a)
    var str = a.length == 1 ? a[0] : [ a.slice(0, a.length - 1).join(", "), a[a.length - 1] ].join(" and ")
    var discordPresence = {}
    discordPresence.state = "By: " + str;
    discordPresence.details = "Listening to: " + globalData.currentSong.title;
    discordPresence.largeImageKey = "listening";
    
    switch(globalData.currentSong.state) {
      case "PLAY":
        discordPresence.smallImageKey = "play";
        discordPresence.smallImageText = "Playing.";
        discordPresence.startTimestamp = Date.now();
        discordPresence.endTimestamp = Date.now() + ((globalData.currentSong.songDuration - globalData.currentSong.listenedTo)*1000);
        break;
      case "PAUSE":
        discordPresence.smallImageKey = "pause";
        discordPresence.smallImageText = "Paused.";
        delete discordPresence.startTimestamp
        delete discordPresence.endTimestamp
        break;
      case "LOADING":
        discordPresence.smallImageKey = "loading";
        discordPresence.smallImageText = "Loading...";
        delete discordPresence.startTimestamp
        delete discordPresence.endTimestamp
        break;
      default:
        discordPresence.smallImageKey = "loading";
        discordPresence.smallImageText = "Loading...";
        delete discordPresence.startTimestamp
        delete discordPresence.endTimestamp
    }
    discordPresence.partyId = globalData.partyId;
    discordPresence.partySize = 1;
    discordPresence.partyMax = 24;
    discordPresence.joinSecret = globalData.joinSecret;
    client.setActivity(discordPresence)
  } else {
    setTimeout(updateDiscord, 1000)
  }
}

//GROUP HANDLING


globalData.ws = new WebSocket('ws://98.7.203.224:42124/');
globalData.ws._send = globalData.ws.send
globalData.ws.send = (data) => {
  //console.log("C --> S", data)
  globalData.ws._send(data)
}

var sendEvent = async (eventinp, data) => {
  await syncPause(100);
  globalData.ws.send(JSON.stringify({
    "type": eventinp,
    "content": {
      "event": eventinp,
      "data": data
    },
    "channelToken": globalData.joinSecret
  }))
}

var joinSever = (id) => {
  globalData.network.enabled = true;
  globalData.joinSecret = id
  globalData.ws.send(JSON.stringify({
    "type": 'joinChannel',
    "channelToken": id
  }))
}

globalData.ws.on('open', function open() {
  globalData.ws.send(JSON.stringify({
    "type": "createChannel",
    "channelToken": globalData.joinSecret
  }))
});
 
globalData.ws.on('message', function incoming(data) {
  data = JSON.parse(data)
  //console.log("S -> C", JSON.stringify(data));
  switch(data.type) {
    case "ERROR":
      //console.log(data)
      break;
    case "PING":
      globalData.ws.send(JSON.stringify({
        "type": "PONG",
        "data": Date.now()
      }))
    default:
      myEmitter.emit(data.type, data);
      break;
  }
});

// handle network

myEmitter.on('SONG_CHANGE', (data) => {
  globalData.network.state = data.data;
  globalData.window.webContents.executeJavaScript(`var id = "${data.data.id}"; document.location.href = "https://music.youtube.com/watch?v=" + id`)
});
myEmitter.on("DEAD_CHANNEL", (event, songObject) => { //FINISHED
  delete globalData.network
  globalData.network.enabled = false;
  globalData.joinSecret = "JS_" + randomstring.generate()
  globalData.window.webContents.executeJavaScript(`document.location.href = "https://music.youtube.com/"`)
  globalData.ws.send(JSON.stringify({
    "type": "createChannel",
    "channelToken": globalData.joinSecret
  }))
})
myEmitter.on('PLAY', (data) => {
  globalData.network.state = data.data;
});
myEmitter.on('PAUSE', (data) => {
  globalData.network.state = data.data;
});
myEmitter.on('LOADING', (data) => {
  globalData.network.state = data.data;
});
myEmitter.on('SCRUB_TO', (data) => {
  globalData.network.state = data.data;
});
myEmitter.on('CHANNEL_STATE', (data) => {
  globalData.window.webContents.executeJavaScript(`var id = "${data.data.SONG.id}"; document.location.href = "https://music.youtube.com/watch?v=" + id`)
  globalData.network.state = data.data.SONG;
});
//handle settings module

settingsModule.events.on('JOIN_BY_ID', (_event, id) => {
  //console.log("JOIN BY ID", id)
  joinSever(id)
})
//handle connections module

myEmitter.on("USER_DATA", (data) => {
  globalData.connectedUsers = data.data
})
connectionsModule.events.on('GET_USERS', (_event, id) => {
  _event.returnValue = globalData.connectedUsers
})

setInterval(() => {
  globalData.ws.send(JSON.stringify({
    "type": "USER_DATA_REQUEST"
  }))
}, 1000)