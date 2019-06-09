const ipc = require('electron').ipcRenderer
const songStates = [
  "",
  "PLAY",
  "PAUSE",
  "LOADING"
]
const authorStringParser = (authorString) => {
  var returnobject = [];
  var basic = authorString.split(" & ")
  returnobject.push(basic.pop())
  basic = basic[0]
  if (basic) {
    var complex = basic.split(", ")
  } else {
    var complex = [];
  }
  var stage2 = complex.concat(returnobject)
  var returnobjectstage2 = [];
  stage2.forEach(stage => {
    returnobjectstage2.push({
      "text": stage
    })
  })
  return returnobjectstage2
}
const accountParser = (rawacc) => {
  var returnobject = {
    'alts': []
  };
  rawacc.forEach(account => {
    if(account.active) {
      returnobject.email = account.email
      returnobject.name = account.name
      returnobject.photo_url = account.photo_url
      returnobject.switch_url = account.switch_url
    } else {
      returnobject.alts.push(account)
    }
  })
  return returnobject
}

window.lastSongObject = {}
window.lastFocusState = false;

window.executedScripts = [];
window.executeScript = (id, script) => {
  console.log(id, script)
  if(window.executedScripts[id]) {
    if(Date.now() - window.executedScripts[id].lastCall < 50) {
      script();
    } else {
      console.log("LAST CALL TO LATE")
    }
    window.executedScripts[id].lastCall = Date.now()
  } else {
    window.executedScripts[id] = {
      "lastCall": Date.now()
    }
  }
}

document.addEventListener('DOMContentLoaded', function(){ 
  console.log("LOADED")
  // make the title bar dragable.
  document.getElementsByClassName('center-content style-scope ytmusic-nav-bar')[0].style.webkitAppRegion = "drag"
  // make the items on the bar clickable.
  document.getElementsByClassName('right-content style-scope ytmusic-nav-bar')[0].style.webkitAppRegion = 'no-drag'
  document.getElementsByClassName('style-scope ytmusic-nav-bar')[7].style.webkitAppRegion = 'no-drag'
  document.getElementsByClassName('style-scope ytmusic-nav-bar')[8].style.webkitAppRegion = 'no-drag'
  
  // add custom setting
  
  // super jank, but don't know how to detect it otherwise
  setTimeout(() => {
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[5] = JSON.parse(JSON.stringify(_ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[2]))
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[5].compactLinkRenderer.title.runs[0].text = "Desktop Youtube Music Settings"
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[5].compactLinkRenderer.icon.iconType = "SETTINGS"
delete _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[5].compactLinkRenderer.navigationEndpoint.commandMetadata
delete _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[5].compactLinkRenderer.navigationEndpoint.urlEndpoint
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[5].compactLinkRenderer.navigationEndpoint.scriptEndpoint = {"id": "0102", "value": () => {
          // code to run on click
          ipc.send("SETTINGS_CLICK")
       }}
       
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[6] = JSON.parse(JSON.stringify(_ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[2]))
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[6].compactLinkRenderer.title.runs[0].text = "Connected Users"
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[6].compactLinkRenderer.icon.iconType = "SWITCH_ACCOUNTS"
delete _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[6].compactLinkRenderer.navigationEndpoint.commandMetadata
delete _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[6].compactLinkRenderer.navigationEndpoint.urlEndpoint
       _ga_.navigator.accountService.cachedGetAccountMenuRequestPromise.result_.data.actions[0].openPopupAction.popup.multiPageMenuRenderer.sections[1].multiPageMenuSectionRenderer.items[6].compactLinkRenderer.navigationEndpoint.scriptEndpoint = {"id": "0103", "value": () => {
          // code to run on click
          ipc.send("CONNECTED_USERS_CLICK")
       }}
  }, 1000)
  
}, false);

setInterval(() => {
  //update content
  
  //build songObject
  var token = "__data__"
  var token2 = "currentItem_"
  if(document.getElementsByClassName('style-scope ytmusic-app')[8].__data) {
    token = "__data"
  }
  try {
    var songObject = {
      "isPlaying": true,
      "title": document.getElementsByClassName('style-scope ytmusic-app')[8][token][token2].title.runs[0].text,
      "authors": authorStringParser(document.getElementsByClassName('style-scope ytmusic-app')[8][token][token2].shortBylineText.runs[0].text),
      "id": _ga_.playerController.playerApi.getVideoData()["video_id"],
      "songDuration": _ga_.playerController.playerApi.getDuration(),
      "listenedTo": _ga_.playerController.playerApi.getCurrentTime()*100,
      "state": songStates[_ga_.playerController.playerApi.getPlayerState()],
      "icon": document.getElementsByClassName('style-scope ytmusic-app')[8][token][token2].thumbnail.thumbnails[document.getElementsByClassName('style-scope ytmusic-app')[8][token][token2].thumbnail.thumbnails.length - 1].url,
      "_startedAt": (Date.now() - _ga_.playerController.playerApi.getCurrentTime()*1000)
    }
  } catch(e) {
    console.log(e)
    var songObject = {
      "isPlaying": false
    }
  }
  
  if(window.lastSongObject.state != songObject.state && songObject.state != undefined) {
    ipc.send(songObject.state, songObject)
  }
  
  // should return 'undefined' if not playing, which won't equal a song name.
  // do !== rather than != in case the song is called "undefined". fuck whoever does that.
  
  if(songObject.title !== window.lastSongObject.title) {
    ipc.send("SONG_CHANGE", songObject)
  }
  ipc.send("UPDATE_RAW", songObject)
  
  //check if window is in focus
  
  if(window.lastFocusState != document.hasFocus()) {
    ipc.send("FOCUS_CHANGE", document.hasFocus())
  }
  window.lastFocusState = document.hasFocus();
  
  //check if we have scrubbed to a different position
  
  if(Math.abs(window.lastSongObject.listenedTo-songObject.listenedTo) > 50) {
    console.log(window.lastSongObject.listenedTo, songObject.listenedTo)
    ipc.send("SCRUB_TO", songObject)
  }
  
  window.lastSongObject = songObject
  
  var rawAccounts = yt.config_.ACCOUNTS
  var parsed = accountParser(rawAccounts)
  try {
    if(parsed.email != window.accounts.email) {
      ipc.send("UPDATE_ACCOUNT", parsed)
    }
    window.accounts = parsed
  } catch(err) {
    ipc.send("UPDATE_ACCOUNT", parsed)
    window.accounts = parsed
  }
  
}, 10)

//network handler

setInterval(() => {
  window.network = ipc.sendSync("GET_NETWORK")
  //console.log(network)
  if(network.enabled) {
    if(Math.abs((Date.now() -  _ga_.playerController.playerApi.getCurrentTime()*1000) - network.state._startedAt) > 500 && _ga_.playerController.playerApi.getPlayerState() != 3) {
      console.log("SCRUBBING TO!")
      _ga_.playerController.playerApi.seekTo((Date.now() - network.state._startedAt)/1000)
    }
    if(network.state.state != songStates[_ga_.playerController.playerApi.getPlayerState()]) {
      if(songStates[_ga_.playerController.playerApi.getPlayerState()] != "LOADING") {
        if((network.state.state == "PAUSE" || network.state.state == "LOADING") && (songStates[_ga_.playerController.playerApi.getPlayerState()] == "PLAY")) {
          document.getElementById("play-pause-button").click()
        }
        if((network.state.state == "PLAY") && (songStates[_ga_.playerController.playerApi.getPlayerState()] == "PAUSE")) {
          document.getElementById("play-pause-button").click()
        }
      }
    }
  }
}, 10)