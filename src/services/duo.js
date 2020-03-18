const { get: getGuild } = require('./guild');

const DATABASE_DUO_CHANNEL = '689722034032476189';

const getDatabaseDuo = client => getGuild(client)
  .channels
  .cache
  .get(DATABASE_DUO_CHANNEL);

const matcher = query => {
  const { id, name } = query;
  const matcher = [];
  
  if (id) matcher.concat[`${id}`];
  if (name) matcher.concat[`"${name}"`];
  
  return new RegExp(matcher.join(' '));
}

function create(client, roleId, name) {
  return getDatabaseDuo(client).send(`${roleId} "${name}"`);
}

async function query(client, query) {
  const duplaMessages = await getDatabaseDuo(client)
    .messages
    .fetch({ limit: 100 });

  return duplaMessages.find(m => matcher(query).test(m.content));
}

function _delete(duo) {
  return duo.delete();
}

module.exports = {
  create,
  query,
  delete: _delete
};