const ipc = require('electron').ipcRenderer
const songStates = [
  "PLAYING",
  "PAUSED",
  "LOADING"
]
const authorStringParser = (authorString) => {
  var returnobject = [];
  var basic = authorString.split(" & ")
  returnobject.push(basic.pop())
  basic = basic[0]
  var complex = basic.split(", ")
  return complex.concat(returnobject)
}

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
  
  var songObject = {
    "title": document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.title.runs[0].text,
    "authors": authorStringParser(document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.shortBylineText.runs[0].text),
    "album": [
      "// Array of album objects //",
    ],
    "id": _ga_.playerController.playerApi.getVideoData()["video_id"],
    "songDuration": _ga_.playerController.playerApi.getDuration(),
    "listenedTo": _ga_.playerController.playerApi.getCurrentTime(),
    "state": songStates[_ga_.playerController.playerApi.getPlayerState()],
    "icon": document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.thumbnail.thumbnails[document.getElementsByClassName('style-scope ytmusic-app')[8].__data__.currentItem_.thumbnail.thumbnails.length - 1].url
  }
}, 10)