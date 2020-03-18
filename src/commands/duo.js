const { get: getGuild } = require('../services/guild');
const memberService = require('../services/member');
const duoService = require('../services/duo');
const nicknameService = require('../services/nickname');

const getCommands = require('../channels/comandos');
const getDuos = require('../channels/duplas');

const noNicknameMessage = "Primeiro registre seu nickname do Minecraft.";
const createSuccessMessage = "Dupla criada com sucesso! Você já está nela, não é necessário entrar.";
const noDuoMessage = "Essa dupla não existe. Tem certeza que digitou corretamente?";
const fullDuoMessage = "Essa dupla está cheia.";
const enterDuoSuccessMessage = "Entrou na dupla com sucesso!";
const invalidUsageMessage = "Utilização inválida de comando, leia as mensagens fixadas para documentação.";

const matchDuos = /^\/duplas (\w+)/;
const matchDuosCreate = /^\/duplas criar "(.+)"$/;
const matchDuosEnter = /^\/duplas entrar "(.+)"$/;
const matchDuosLeave = /^\/duplas sair$/;
const matchDuosColor = /^\/duplas cor (\w+|#[0-9A-Fa-f]{6})$/;
const matchHexString = /^#[0-9A-Fa-f]{6}$/;

const makeDuoMessage = (name, [members]) => `
**${name}**
  - <@${members[0].id}>
  - <@${members[1].id}>
`;

async function executeDuosCreate(client, message) {
  const { member, content } = message;
  const { id: memberId } = member;
  const commandsChannel = getCommands(client);

  const valid = await nicknameService.query(client, { id: memberId });
  if (!valid) {
    return await commandsChannel.send(noNicknameMessage);  
  }

  const name = matchDuosCreate.exec(content)[1];

  const roleData = { data: { name, hoist: true } };
  const role = await getGuild(client).roles.create(roleData);
  await member.roles.add(role);
  
  const { id: roleId } = role;
  await duoService.create(client, roleId, name);
  await memberService.create(client, roleId, memberId);

  await commandsChannel.send(createSuccessMessage);
}

async function executeDuosEnter(client, message) {
  const { member, content } = message;
  const { id: memberId } = member;
  const commandsChannel = getCommands(client);
  const duosChannel = getDuos(client);

  const valid = await nicknameService.query(client, { id: memberId });
  if (!valid) {
    return await commandsChannel.send(noNicknameMessage);
  }

  const name = matchDuosEnter.exec(content)[1];
  const role = getGuild(client).roles.cache.find(r => r.name == name);
  if (!role) {
    return await commandsChannel.send(noDuoMessage);
  }

  if (role.members.length >= 2) {
    return await commandsChannel.send(fullDuoMessage);
  }

  const firstMember = role.members.array()[0];
  await member.roles.add(role);
  const members = [firstMember, member];

  await memberService.create(client, role.id, memberId);
  await duosChannel.send(makeDuoMessage(name, members));

  await commandsChannel.send(enterDuoSuccessMessage);
}

async function executeDuosLeave(client, message) {
  const { member, content } = message;
  const { id: memberId, roles } = member;
  const commandsChannel = getCommands(client);


  const valid = matchDuosLeave.test(content);
  if (!valid) {
    return await commandsChannel.send(invalidUsageMessage);
  }

  if (!roles.cache.size > 1) {
    return await commandsChannel.send(aloneMessage);
  }
  
  const duoRole = roles.cache.first();
  await roles.remove(duoRole);
  const membership = await memberService.query(client, { member: memberId });
  await memberService.delete(membership);
  
  if (duoRole.members.size === 0) {
    const duo = await duoService.query(client, { id: duoRole.id });
    await duoService.delete(duo);
    await duoRole.delete();
  }

  await commandsChannel.send(leaveDuoSuccessMessage);
}

async function executeDuosColor(client, message) {
  const { member, content } = message;
  const { roles } = member;
  const commandsChannel = getCommands(client);
  

  const valid = matchDuosColor.test(content);
  if (!valid) {
    return await commandsChannel.send(invalidUsageMessage);
  }

  if (!roles.cache.size > 1) {
    return await commandsChannel.send(aloneMessage);
  }

  const color = matchDuosColor.exec(content)[1];
  if (!matchHexString.test(color) && !constants.colors.includes(color)) {
    return await client.send("Cor inválida.");
  }

  await roles.cache.first().setColor(color);

  await commandsChannel.send(changeColorSuccessMessage);
}

async function handleDuo(client, message) {
  const { content } = message;
  const valid = matchDuos.test(content);
  const commandsChannel = getCommands(client);

  if (!valid) {
    return await commandsChannel(invalidUsageMessage);
  }

  const command = matchDuos.exec(content)[1];

  switch(command) {
    case 'criar':
      return await executeDuosCreate(client, message);
    case 'entrar':
      return await executeDuosEnter(client, message);
    case 'sair':
      return await executeDuosLeave(client, message);
    case 'cor':
      return await executeDuosColor(client, message);
    default:
      return await commandsChannel.send(invalidUsageMessage);
  }
}

module.exports = handleDuo;