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

document.addEventListener('DOMContentLoaded', function(){ 
  
  // make the title bar dragable.
  document.getElementsByClassName('center-content style-scope ytmusic-nav-bar')[0].style.webkitAppRegion = "drag"
  // make the items on the bar clickable.
  document.getElementsByClassName('right-content style-scope ytmusic-nav-bar')[0].style.webkitAppRegion = 'no-drag'
  document.getElementsByClassName('style-scope ytmusic-nav-bar')[7].style.webkitAppRegion = 'no-drag'
  document.getElementsByClassName('style-scope ytmusic-nav-bar')[8].style.webkitAppRegion = 'no-drag'
  
  
}, false);

setInterval(() => {
  //update content
  
  //build songObject
  
  try {
    var songObject = {
      "isPlaying": true,
      "title": document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.title.runs[0].text,
      "authors": authorStringParser(document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.shortBylineText.runs[0].text),
      "id": _ga_.playerController.playerApi.getVideoData()["video_id"],
      "songDuration": _ga_.playerController.playerApi.getDuration(),
      "listenedTo": _ga_.playerController.playerApi.getCurrentTime(),
      "state": songStates[_ga_.playerController.playerApi.getPlayerState()],
      "icon": document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.thumbnail.thumbnails[document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.thumbnail.thumbnails.length - 1].url
    }
  } catch(e) {
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
  
  if(Math.abs(window.lastSongObject.listenedTo-songObject.listenedTo) > 0.05) {
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