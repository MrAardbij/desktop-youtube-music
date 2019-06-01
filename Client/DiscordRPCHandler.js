const DiscordRPC = require('discord-rpc');
var events = require('events').EventEmitter;
var emitter = new events.EventEmitter();
module.exports = (clientId, scopes) => {
  DiscordRPC.register(clientId);
  const client = new DiscordRPC.Client({ transport: 'ipc' });
  
  client.transport.on('message', (command) => {
    console.log(command.cmd, command.data)
    emitter.emit(command.cmd, command.data)
  })
  
  client.on('ready', () => {
    emitter.emit('ready')
  })
  if(scopes) {
    client.login({ clientId, scopes }).catch((e) => {
      emitter.emit('error', e)
    });
  } else {
    client.login({ clientId }).catch((e) => {
      emitter.emit('error', e)
    });
  }
  return client
}

module.exports.emitter = emitter;
