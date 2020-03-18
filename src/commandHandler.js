const getCommands = require('./channels/comandos');
const handleDuo = require('./commands/duo');
const handleNickname = require('./commands/nickname');

const invalidUsageMessage = "Utilização inválida de comando, leia as mensagens fixadas para documentação.";

const matchCommand = /^\/(\S+)/;

module.exports = async (client, message) => {
  const { content } = message;
  const commandsChannel = getCommands(client);

  const valid = matchCommand.test(content);
  if (!valid) {
    return;
  }
  const command = matchCommand.exec(content)[1];
  
  switch (command) {
    case 'duplas':
      return await handleDuo(client, message);
    case 'nickname':
      return await handleNickname(client, message);
    default:
      return await commandsChannel.send(invalidUsageMessage);
  }
}