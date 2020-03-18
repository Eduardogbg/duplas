require('dotenv').config();
const Discord = require('discord.js');
const commandHandler = require('./src/commandHandler');

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
    console.error("Erro no message listener", err);
  } 
});
