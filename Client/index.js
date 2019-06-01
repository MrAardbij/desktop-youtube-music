const { app, BrowserWindow, session, ipcMain } = require('electron')
const ipc = ipcMain
let win
var globalData = {};
var d_rpc = require('./DiscordRPCHandler.js')
var client = d_rpc('582505724693839882');
var discord = d_rpc.emitter

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
})

ipc.on("SCRUB_TO", (event, songObject) => { //FINISHED
  console.log("SCRUB_TO", songObject)
})

ipc.on("PAUSE", (event, songObject) => { //FINISHED
  console.log("PAUSE", songObject)
})

ipc.on("PLAY", (event, songObject) => { //FINISHED
  console.log("PLAY", songObject)
})

ipc.on("LOADING", (event, songObject) => { //FINISHED
  console.log("LOADING", songObject)
})

ipc.on("FOCUS_CHANGE", (event, songObject) => { //FINISHED
  console.log("FOCUS_CHANGE", songObject)
})

ipc.on("UPDATE_ACCOUNT", (event, userObject) => { //FINISHED
  console.log("UPDATE_ACCOUNT", userObject)
  globalData.googleUser = userObject
})

//GROUP HANDLING

