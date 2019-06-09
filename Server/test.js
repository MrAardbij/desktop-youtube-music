const readline = require('readline');
const WebSocket = require('ws');
 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
 
const ws = new WebSocket('ws://localhost:42124/');
 
ws.on('open', function open() {
  console.log("OPEN")
});
 
ws.on('message', function incoming(data) {
  console.log(data);
});

rl.on('line', (input) => {
  input = String(input)
  ws.send(input)
});
