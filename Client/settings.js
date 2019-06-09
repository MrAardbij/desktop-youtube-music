const ipc = require('electron').ipcRenderer

window.goClick = (self) => {
  ipc.send("JOIN_BY_ID", self.parentElement.children[0].value)
}