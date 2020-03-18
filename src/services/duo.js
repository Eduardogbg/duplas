const { get: getGuild } = require('./guild');

const DATABASE_DUO_CHANNEL = '689722034032476189';

const getDatabaseDuo = client => getGuild(client)
  .channels
  .cache
  .get(DATABASE_DUO_CHANNEL);

const matcher = query => {
  const { id, name } = query;

  return ({ content }) => {
    let match = true;

    if (id) {
      match = match && content.startsWith(id);
    }

    if (name) {
      match = match && content.endsWith(`"${name}"`);
    }

    return match;
  }
}

function create(client, roleId, name) {
  return getDatabaseDuo(client).send(`${roleId} "${name}"`);
}

async function query(client, query) {
  const duplaMessages = await getDatabaseDuo(client)
    .messages
    .fetch({ limit: 100 });

  return duplaMessages.find(matcher(query));
}

function _delete(duo) {
  return duo.delete();
}

module.exports = {
  create,
  query,
  delete: _delete
};