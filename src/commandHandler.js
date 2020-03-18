const constants = require('./constants');
const { get: getGuild } = require('./services/guild');
const duoService = require('./services/duo');
const memberService = require('./services/member');
const nicknameService = require('./services/nickname');

const COMANDOS_CHANNEL = '689672871215497278';
const DUPLAS_CHANNEL = '689651612649521152';

const USAGE_ERROR_MESSAGE = "Comando inválido, leia as mensagens fixadas.";
const NO_NICKNAME_MESSAGE = "Primeiro defina seu nickname do Minecraft. Leia as mensagens fixadas.";
const NO_DUO_MESSAGE = "Essa dupla não existe, você digitou certo? Para criar uma dupla, leia as mensagens fixadas.";
const FULL_DUO_MESSAGE = "Essa dupla já está preenchida.";
const LEAVING_NOWHERE_MESSAGE = "Vocênão está em nenhuma dupla.";

const matchCommand = /^\/(\S+)/;
const matchNickname = /^\/nickname (\w{3,16})$/;
const matchDuplas = /^\/duplas (\w+)/;
const matchDuplasCriar = /^\/duplas criar "(.+)"$/;
const matchDuplasEntrar = /^\/duplas entrar "(.+)"$/;
const matchDuplasSair = /^\/duplas sair$/;
const matchDuplasCor = /^\/duplas cor (\w+|#[0-9A-Fa-f]{6})$/;
const matchHexString = /^#[0-9A-Fa-f]{6}$/;


const getComandos = client => getGuild(client)
  .channels
  .cache
  .get(COMANDOS_CHANNEL);

const getDuplas = client => getGuild(client)
  .channels
  .cache
  .get(DUPLAS_CHANNEL);

const makeDuoMessage = (name, [members]) => `
${name}
- ${members[0].nickname}
- ${members[1].nickname}
`;

const usageError = client => getComandos(client).send(USAGE_ERROR_MESSAGE);
const noNickname = client => getComandos(client).send(NO_NICKNAME_MESSAGE);
const noDuo = client => getComandos(client).send(NO_DUO_MESSAGE);
const fullDuo = client => getComandos(client).send(FULL_DUO_MESSAGE);
const leavingNowhere = client => getComandos(client).send(LEAVING_NOWHERE_MESSAGE);

async function executeDuplasCriar(client, message) {
  const { member, content } = message;
  const { id: memberId } = member;
  
  const valid = await nicknameService.query(client, { id: memberId });
  if (!valid) {
    return await noNickname(client);  
  }

  const name = matchDuplasCriar.exec(content)[1];

  const roleData = { data: { name } };
  const role = await getGuild(client).roles.create(roleData);
  await member.roles.add(role);
  
  const { id: roleId } = role;
  await duoService.create(client, roleId, name);
  await memberService.create(client, roleId, memberId);
}

async function executeDuplasEntrar(client, message) {
  const { member, content } = message;
  const { id: memberId } = member;

  const valid = await nicknameService.query(client, { id: memberId });
  if (!valid) {
    return await noNickname(client);
  }

  const name = matchDuplasEntrar.exec(content)[1];
  const role = getGuild(client).roles.find(r => r.name == name);
  if (!role) {
    return await noDuo(client);
  }

  if (role.members.length >= 2) {
    return await fullDuo(client);
  }

  const firstMember = role.members.array()[0];
  await member.roles.add(role);
  const members = [firstMember, member];

  await memberService.create(client, roleId, memberId);
  await getDuplas(client).send(makeDuoMessage(name, members));
}

async function executeDuplasSair(client, message) {
  const { member, content } = message;
  const { id: memberId, roles } = member;

  const valid = matchDuplasSair.test(content);
  if (!valid) {
    return await usageError(client);
  }

  if (!roles.cache.size > 1) {
    return await leavingNowhere(client);
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
}

async function executeDuplasCor(client, message) {
  const { member, content } = message;
  const { roles } = member;
  
  const valid = matchDuplasCor.test(content);
  if (!valid) {
    return await usageError(client);
  }

  if (!roles.cache.size > 1) {
    return await leavingNowhere(client);
  }

  const color = matchDuplasCor.exec(content)[1];
  if (!matchHexString.test(color) && !constants.colors.includes(color)) {
    return await client.send("Cor inválida.");
  }

  await roles.cache.first().setColor(color);
}

async function handleDuplas(client, message) {
  const { content } = message;
  const valid = matchDuplas.test(content);
  if (!valid) {
    return await usageError(client);
  }

  const command = matchDuplas.exec(content)[1];

  switch(command) {
    case 'criar':
      return await executeDuplasCriar(client, message);
    case 'entrar':
      return await executeDuplasEntrar(client, message);
    case 'sair':
      return await executeDuplasSair(client, message);
    case 'cor':
      return await executeDuplasCor(client, message);
    default:
      return await usageError(client);
  }
}

async function executeNickname(client, message) {
  const { member, content } = message;
  const { id } = member;
  
  const valid = matchNickname.test(message);
  if (!valid) {
    return await usageError(client);
  }

  const nickname = matchNickname.exec(content)[1];
  await member.setNickname(nickname);
  
  const previous = await nicknameService.query(client, { nickname });
  if (previous) {
    await nicknameService.edit(previous, id, nickname);
  } else {
    await nicknameService.create(client, id, nickname);
  }
}

module.exports = async (client, message) => {
  const { content } = message;
  
  const valid = matchCommand.test(content);
  if (!valid) {
    return;
  }
  const command = matchCommand.exec(content)[1];
  
  switch (command) {
    case 'duplas':
      return await handleDuplas(client, message);
    case 'nickname':
      return await executeNickname(client, message);
    default:
      return await usageError(client);
  }
}