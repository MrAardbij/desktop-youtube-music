

const { ipcRenderer } = require('electron')
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

window.myEmitter = new MyEmitter();

var addUser = function(data){
  if(data.email) {
    var icons = [`
      <img class="svgKick" src="./outline-highlight_off-24px.svg" onclick="kick(this.parentElement.parentElement.children[2].innerText)">`,`
      <img class="svgOwner" src="./outline-verified_user-24px.svg">`]
    var icon = ``;
    if(data.own) {
      icon = icons[1]
    } else {
      icon = icons[0]
    }
    var html = `<div class="connectedUser">
      <div class="childLeft">
        <img src="${data.photo_url}" height="55px"></img>
      </div>
      <div class="childRight">
        <div class="childinnerRight">${icon}
        </div>
        <pre class="user">${data.name}</pre>
        <pre class="email">${data.email}</pre>
      </div>
    </div>`
    document.getElementById('midDiv').innerHTML = document.getElementById('midDiv').innerHTML + html;
  }
};

var clear = (() => {
  document.getElementById('midDiv').innerHTML = ""
})

var kick = (a) => {
  ipcRenderer.send('kickUser', a)
}

setInterval(() => {
  window.users = ipcRenderer.sendSync("GET_USERS")
  console.log(users)
  clear();
  users.forEach(user => {
    var userproxy = user.acc[1]
    userproxy.own = user.own
    addUser(userproxy)
  })
},10)