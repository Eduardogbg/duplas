require('dotenv').config();
const Discord = require('discord.js');
const commandHandler = require('./src/commandHandler');

const ERROR_CHANNEL = '689747252562231306';
const { TOKEN } = process.env;

const bot = new Discord.Client();
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Duplas pronto como ${bot.user.tag}!`);
});

bot.on('message', async message => {
  try {
    if (message.channel.name === 'comandos') {
      console.log('mensagem em comando', message.content)
      await commandHandler(bot, message);
    }
  } catch (err) {
    bot.channels.cache.get(ERROR_CHANNEL).send(`Erro: ${err.message}`);
    console.error("Erro no message listener", err);
  } 
});

// Fucking Heroku
const http = require('http');
const server = new http.Server;
server.listen(process.env.PORT, (...args) => {
  console.log('HTTP', ...args);
});