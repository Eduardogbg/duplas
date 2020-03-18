const { get: getGuild } = require('../services/guild');

const COMANDOS_CHANNEL = '689672871215497278';


module.exports = client => getGuild(client)
  .channels
  .cache
  .get(COMANDOS_CHANNEL);