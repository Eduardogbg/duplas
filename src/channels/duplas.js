const { get: getGuild } = require('../services/guild');

const DUPLAS_CHANNEL = '689651612649521152';

module.exports = client => getGuild(client)
  .channels
  .cache
  .get(DUPLAS_CHANNEL);