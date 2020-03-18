const nicknameService = require('../services/nickname');
const getCommands = require('../channels/comandos');
const matchNickname = /^\/nickname (\w{3,16})$/;

const invalidMessage = "Sintaxe inválida, confira a documentação nas mensagens fixadas.";
const successMessage = "Nickname trocado com sucesso!";

async function executeNickname(client, message) {
  const { member, content } = message;
  const { id } = member;
  const commandsChannel = getCommands(client);

  const valid = matchNickname.test(message);
  if (!valid) {
    return await commandsChannel.send(invalidMessage);
  }

  const nickname = matchNickname.exec(content)[1];
  await member.setNickname(nickname);
  
  const previous = await nicknameService.query(client, { id });
  console.log('existia mensagem prévia', previous);
  if (previous) {
    await nicknameService.edit(previous, id, nickname);
  } else {
    await nicknameService.create(client, id, nickname);
  }

  await commandsChannel.send(successMessage);
}

module.exports = executeNickname;
