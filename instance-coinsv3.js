const { fork } = require('child_process');
const Connectdatabase = require("./base/database.js")
const { Bots } = require('./base/Database/Models/Bots.js');
const { ownersend } = require('./base/functions.js');
const { Client } = require('discord.js');
const login = require('./login.js');

Connectdatabase();

const activeClients = {};

async function getAllBots() {
  try {
    const bots = await Bots.findAll({
      where: {
        type: 'coinsv3'
      }
    });

    return bots.map(bot => bot.toJSON());
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des bots :', error);
    return [];
  }
}

async function startBotWithCooldown(data) {
  if (activeClients[data.token]) {
    console.log(`Le bot avec le jeton ${data.token} est déjà actif.`);
    return;
  }

  try {
    //const botProcess = fork('login.js', [JSON.stringify(data)]);
    let bot = await login(data);
    activeClients[data.token] = bot;
  } catch (error) {
    console.error('Une erreur s\'est produite lors du démarrage du bot :', error);
  }
}

function stopBot(token) {
  const process = activeClients[token];

  if (process) {
    process.destroy();
    delete activeClients[token];
    console.log(`Arrêt du bot avec le token ${token}`);
  }
}

async function checkTokenStatus() {
  const tokensFromDatabase = await getAllBots();
  const oneMonthDuration = 30 * 24 * 60 * 60 * 1000;

  for (const data of tokensFromDatabase) {
    const expiredTime = Date.parse(data.DateStart) + parseInt(data.Duration);
    const expired = expiredTime < Date.now();
    const warningTime = expiredTime - 3600000; // One hour before expiration

    if (data.Status === '5') {
      stopBot(data.token);
      continue;
    }

    if (!activeClients[data.token] && !expired && data.Status !== '1') {
      await startBotWithCooldown(data);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      if (expired) {
        stopBot(data.token);
        await Bots.update(
          { Status: '2' },
          { where: { token: data.token }, returning: true }
        );
      } else if (!data.hasWarned && Date.now() >= warningTime) {
        if (!data.lastWarningTime || data.lastWarningTime < warningTime) {
          if (activeClients[data.token]) {
            ownersend(activeClients[data.token], `:alarm_clock: \`Votre bot (moi-même) expire dans moins d'une heure !\`\nPensez à le renouveler: https://discord.gg/CuRTzZMfYw`);
            data.hasWarned = true;
            data.lastWarningTime = Date.now();
            await Bots.update(
              { hasWarned: true, lastWarningTime: data.lastWarningTime },
              { where: { token: data.token }, returning: true }
            );
          }
        }
      }
    }

    const expiredToDelete = expiredTime + oneMonthDuration < Date.now();
    if (expiredToDelete) {
      stopBot(data.token);
      await Bots.destroy({ where: { token: data.token } });
    }
  }

  Object.keys(activeClients).forEach((token) => {
    const foundToken = tokensFromDatabase.find((data) => data.token === token);
    if (!foundToken) {
      stopBot(token);
    }
  });
}

// Vérifier les bots toutes les x millisecondes
setInterval(checkTokenStatus, 8000);

process.on('unhandledRejection', (reason, p) => {
  console.log(reason, p);
});

process.on('uncaughtException', (err, origin) => {
  console.log(err, origin);
});

process.on('multipleResolves', (type, promise, reason) => {
  console.log(type, promise, reason);
});
