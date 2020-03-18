require('dotenv').config();
const Discord = require('discord.js');
const Sequelize = require('sequelize');
const commandHandler = require('./src/commandHandler');

const ERROR_CHANNEL = '689747252562231306';
const { 
  TOKEN,

  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME
} = process.env;

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD, {
    host: DATABASE_HOST,
    dialect: 'mysql',
    dialectModule: require('mysql2')
  }
);

(async () => { 
  try {
    await sequelize.authenticate();
    console.log(`Conectado no MySQL em ${DATABASE_HOST}:3306`);
  } catch (err) {
    console.error('Falha ao conectar no banco de dados', err);
  }
})();

const bot = new Discord.Client();
bot.login(TOKEN);

bot.on('ready', async () => {
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