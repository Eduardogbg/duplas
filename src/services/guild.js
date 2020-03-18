const QUARENTENASSA_GUILD = '689497602290745404';

const get = client => client
  .guilds
  .cache
  .get(QUARENTENASSA_GUILD);

module.exports = { get };
 