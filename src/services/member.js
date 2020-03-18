const { get: getGuild } = require('./guild');

const DATABASE_MEMBER_CHANNEL = '689722129452630019';

const getDatabaseMember = client => getGuild(client)
  .channels
  .cache
  .get(DATABASE_MEMBER_CHANNEL);


const matcher = query => {
  const { duo, member } = query;
  const matcher = [];

  if (duo) matcher.concat[`${duo}`];
  if (member) matcher.concat[`${member}`];

  return new RegExp(matcher.join(' '));
}

function create(client, duoId, memberId) {
  return getDatabaseMember(client).send(`${duoId} ${memberId}`);
}

async function query(client, query) {
  const memberMessages = await getDatabaseMember(client)
    .messages
    .fetch({ limit: 100 });
  
  return memberMessages.find(m => matcher(query).test(m.content));
}

function _delete(membership) {
  return membership.delete();
}

module.exports = {
  create,
  query,
  delete: _delete
};
