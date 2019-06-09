var settings = {}

const { app, BrowserWindow, ipcMain } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile(__dirname + '/settings.html')
}


module.exports = {
  'settings': settings, 
  "window": {
    "data": app,
    "createWindow": createWindow
  },
  "events": ipcMain
}