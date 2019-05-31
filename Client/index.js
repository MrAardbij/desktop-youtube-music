const { app, BrowserWindow, session, ipcMain } = require('electron')
const ipc = ipcMain
let win
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

ipc.on("UPDATE_RAW", (songObject) => {
  
})

ipc.on("SONG_CHANGE", (songObject) => {
  console.log("SONG_CHANGE", songObject)
})

ipc.on("SCRUB_TO", (songObject) => {
  console.log("SCRUB_TO", songObject)
})

ipc.on("PAUSE", (songObject) => {
  console.log("PAUSE", songObject)
})

ipc.on("PLAY", (songObject) => {
  console.log("PLAY", songObject)
})