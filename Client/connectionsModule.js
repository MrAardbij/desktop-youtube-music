var settings = {}

const { app, BrowserWindow, ipcMain } = require('electron')
var globalwindow;
function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 500,
    height: 650,
    webPreferences: {
      nodeIntegration: true
    },
    transparent: true,
    frame:false,
    resizable: false
  })

  // and load the index.html of the app.
  win.loadFile(__dirname + '/connections.html')
  globalwindow = win
}

module.exports = {
  'settings': settings, 
  "window": {
    "data": app,
    "createWindow": createWindow
  },
  "events": ipcMain,
  "globalwindow": globalwindow
}