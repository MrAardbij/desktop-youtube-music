const DiscordRPC = require('discord-rpc');
var events = require('events').EventEmitter;
var emitter = new events.EventEmitter();
module.exports = (clientId, scopes) => {
  DiscordRPC.register(clientId);
  const client = new DiscordRPC.Client({ transport: 'ipc' });
  console.log(client)
  client.transport.on('message', (command) => {
    emitter.emit(command.cmd, command.data)
  })
  
  client.subscribe('ACTIVITY_JOIN', ({ secret }) => {
    emitter.emit('join', secret);
  });
  
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
