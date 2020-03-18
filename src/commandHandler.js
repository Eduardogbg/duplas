const QUARENTENASSA_GUILD = '689497602290745404';

const DATABASE_CHANNEL = '689667999539789844';
const COMANDOS_CHANNEL = '689672871215497278';
const DUPLAS_CHANNEL = '689651612649521152';

const USAGE_ERROR_MESSAGE = "Comando inválido, leia as mensagens fixadas.";
const NO_NICKNAME_MESSAGE = "Primeiro defina seu nickname do minecraft. Leia as mensagens fixadas.";
const NO_DUO_MESSAGE = "Essa dupla não existe, você digitou certo? Para criar uma dupla, leia as mensagens fixadas";

const matchCommand = /^\/(.+)/;
const matchNickname = /^\/nickname (\w{3,16})$/;
const matchDuplas = /^\/duplas (\w+)/;
const matchDuplasCriar = /^\/duplas criar "(.+)"$/;
const matchDuplasEntrar = /^\/duplas entrar "(.+)"$/;


const getGuild = client => client
  .guilds
  .get(QUARENTENASSA_GUILD);

const getDatabase = client => client
  .channels
  .cache
  .get(DATABASE_CHANNEL);

const getComandos = client => client
  .channels
  .cache
  .get(COMANDOS_CHANNEL);

const getDuplas = client => client
  .channels
  .cache
  .get(DUPLAS_CHANNEL);

const makeMatchMemberNick = member => new RegExp(
  `^\(nick\) ${member.tag} ${member.nickname}`
);

const makeDuoMessage = (name, [members]) => `
${name}
- ${members[0].nickname}
- ${members[1].nickname}
`;

const usageError = client => getComandos(client).send(USAGE_ERROR_MESSAGE);
const noNickname = client => getComandos(client).send(NO_NICKNAME_MESSAGE);
const noDuo = client => getComandos(client).send(NO_DUO_MESSAGE);

const nickFilter = ({ content }) => content.startsWith('(nick)');

async function validateNickname(client, member) {
  const matchMemberNick = makeMatchMemberNick(member);
  const nickMessages = await getDatabase(client).awaitMessages(nickFilter);
  
  return nickMessages.find(
    ({ content }) => matchMemberNick.test(content)
  );
}

async function executeDuplasCriar(client, message) {
  const { member, content } = message;
  const { tag } = member;
  
  const valid = await validateNickname(client, member);
  if (!valid) {
    return await noNickname(client);  
  }

  const name = matchDuplasCriar.exec(content)[1];

  const roleData = { name };
  const role = await getGuild(client).roles.create(roleData);
  await member.roles.add(role);

  await getDatabase(client).send(`(dupla) "${name}"`);
  await getDatabase(client).send(`(membro) "${name}" ${tag}`);
}

async function executeDuplasEntrar(client, message) {
  const { member, content } = message;
  const { tag } = member;

  const valid = await validateNickname(client, member);
  if (!valid) {
    return await noNickname(client);
  }

  const name = matchDuplasEntrar.exec(content)[1];
  const role = getGuild(client).roles.cache.find(r => r.name == name);
  if (!role) {
    return await noDuo(client);
  }

  const firstMember = role.members.array()[0];
  await member.roles.add(role);
  const members = [firstMember, member];

  await getDatabase(client).send(`(membro) "${name}" ${tag}`);
  await getDuplas(client).send(makeDuoMessage(name, members));
}

async function handleDuplas(client, message) {
  const command = matchDuplas.exec(message.content)[1];

  switch(command) {
    case 'criar':
      return await executeDuplasCriar(client, message);
    case 'entrar':
      return await executeDuplasEntrar(client, message);
    default:
      return await usageError(client);
  }
}

async function executeNickname(client, message) {
  const { member, content } = message;
  const { tag } = member;
  
  const valid = matchNickname.test(message);
  if (!valid) {
    return await usageError(client);
  }

  const nickname = matchNickname.exec(content)[1];
  await member.setNickname(nickname);
  
  await getDatabase(client).send(`(nick) ${tag} ${nickname}`);
}

module.exports = async (client, message) => {
  const command = matchCommand.exec(message.content)[1];

  switch (command) {
    case 'duplas':
      return await handleDuplas(client, message);
    case 'nickname':
      return await executeNickname(client, message);
    default:
      return await usageError(client);
  }
}