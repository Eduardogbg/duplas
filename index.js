require('dotenv').config();
const Discord = require('discord.js');
const commandHandler = require('./src/commandHandler');


const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Duplas pronto como ${bot.user.tag}!`);
});

bot.on('message', async message => {
  if (message.channel === 'comandos') {
    await commandHandler(client, message);
  }
});
