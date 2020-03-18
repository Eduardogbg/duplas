const { get: getGuild } = require('./guild');

const DATABASE_NICKNAME_CHANNEL = '689667999539789844';

const getDatabaseNickname = client => getGuild(client)
  .channels
  .cache
  .get(DATABASE_NICKNAME_CHANNEL);

const matcher = query => {
  const { id, nickname } = query;
  const matcher = [];

  if (id) matcher.concat[`${id}`];
  if (nickname) matcher.concat[`"${nickname}"`];

  return new RegExp(matcher.join(' '));
}

function create(client, memberId, nickname) {
  return getDatabaseNickname(client).send(`${memberId} "${nickname}"`);
}

async function query(client, query) {
  const nicknameMessages = await getDatabaseNickname(client)
    .messages
    .fetch({ limit: 100 });
  
  return nicknameMessages.find(m => matcher(query).test(m.content));
}

function edit(nicknameMessage, memberId, nickname) {
  nicknameMessage.edit(`${memberId} "${nickname}"`);
}

module.exports = {
  create, query, edit
};
