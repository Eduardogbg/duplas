const { get: getGuild } = require('./guild');

const DATABASE_NICKNAME_CHANNEL = '689667999539789844';

const getDatabaseNickname = client => getGuild(client)
  .channels
  .cache
  .get(DATABASE_NICKNAME_CHANNEL);

const matcher = query => {
  const { id, nickname } = query;

  return ({ content }) => {
    let match = true;

    if (id) {
      match = match && content.startsWith(id);
    }

    if (nickname) {
      match = match && content.endsWith(`"${nickname}"`);
    }

    return match;
  }
}

function create(client, memberId, nickname) {
  return getDatabaseNickname(client).send(`${memberId} "${nickname}"`);
}

async function query(client, query) {
  const nicknameMessages = await getDatabaseNickname(client)
    .messages
    .fetch({ limit: 100 });
  
  return nicknameMessages.find(matcher(query));
}

function edit(nicknameMessage, memberId, nickname) {
  nicknameMessage.edit(`${memberId} "${nickname}"`);
}

module.exports = {
  create, query, edit
};
