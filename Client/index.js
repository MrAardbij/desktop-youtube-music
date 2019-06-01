const { app, BrowserWindow, session, ipcMain } = require('electron')
const ipc = ipcMain
let win
var globalData = {};
const notifier = require('node-notifier');
var d_rpc = require('./DiscordRPCHandler.js')
var client = d_rpc('582505724693839882');
var discord = d_rpc.emitter
const path = require('path');
const request = require('request');
const randomstring = require('randomstring');
globalData.partyId = randomstring.generate()
globalData.joinSecret = randomstring.generate()
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
    backgroundColor: "#000"
  })
  win.loadURL('https://music.youtube.com/')
  win.on('closed', () => {
    win = null
  })
  
  //intercept requests for youtube's music_polymer.js file
  //and replace it with our own
  const filter = {
    urls: ['*://music.youtube.com/s/music/*/music_polymer.js']
  }
  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    callback({ redirectURL: "file://" + __dirname + "/modified_polymer.js" })
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

ipc.on("UPDATE_RAW", (event, songObject) => { //FINISHED
  globalData.currentSong = songObject
})

ipc.on("SONG_CHANGE", (event, songObject) => { //FINISHED
  console.log("SONG_CHANGE", songObject)
  if(!globalData.inFocus) {
    prompt(songObject)
  }
  updateDiscord();
})

ipc.on("SCRUB_TO", (event, songObject) => { //FINISHED
  console.log("SCRUB_TO", songObject)
  updateDiscord();
})

ipc.on("PAUSE", (event, songObject) => { //FINISHED
  console.log("PAUSE", songObject)
  updateDiscord();
})

ipc.on("PLAY", (event, songObject) => { //FINISHED
  console.log("PLAY", songObject)
  updateDiscord();
})

ipc.on("LOADING", (event, songObject) => { //FINISHED
  console.log("LOADING", songObject)
  updateDiscord();
})


ipc.on("FOCUS_CHANGE", (event, inFocus) => { //FINISHED
  console.log("FOCUS_CHANGE", inFocus)
  globalData.inFocus = inFocus
})

ipc.on("UPDATE_ACCOUNT", (event, userObject) => { //FINISHED
  console.log("UPDATE_ACCOUNT", userObject)
  globalData.googleUser = userObject
})


var prompt = (songObject) => {
  var stream = request(songObject.icon.split('=')[0] + "=w240-h240-l90-rj").pipe(fs.createWriteStream(path.join(__dirname, 'TMP_ICON.jpg')))
  var a = [];
  songObject.authors.forEach(author => {
    a.push(author.text)
  })
  console.log(a)
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

var updateDiscord = () => {
  var a = [];
  try {
    globalData.currentSong.authors.forEach(author => {
      a.push(author.text)
    })
  } catch(err) {
    a = [];
  }
  console.log(a)
  var str = a.length == 1 ? a[0] : [ a.slice(0, a.length - 1).join(", "), a[a.length - 1] ].join(" and ")
  var discordPresence = {}
  discordPresence.state = "By: " + str;
  discordPresence.details = "Listening to: " + globalData.currentSong.title;
  discordPresence.startTimestamp = Date.now();
  discordPresence.endTimestamp = Date.now() + ((globalData.currentSong.songDuration - globalData.currentSong.listenedTo)*1000);
  discordPresence.largeImageKey = "listening";
  
  switch(globalData.currentSong.state) {
    case "PLAY":
      discordPresence.smallImageKey = "play";
      discordPresence.smallImageText = "Playing.";
      break;
    case "PAUSE":
      discordPresence.smallImageKey = "pause";
      discordPresence.smallImageText = "Paused.";
      break;
    case "LOADING":
      discordPresence.smallImageKey = "loading";
      discordPresence.smallImageText = "Loading...";
      break;
    default:
      discordPresence.smallImageKey = "loading";
      discordPresence.smallImageText = "Loading...";
  }
  discordPresence.partyId = globalData.partyId;
  discordPresence.partySize = 1;
  discordPresence.partyMax = 24;
  discordPresence.joinSecret = globalData.joinSecret;
  client.setActivity(discordPresence)
}

//GROUP HANDLING

