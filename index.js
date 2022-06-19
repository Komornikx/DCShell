require('dotenv').config();
require('./src/db/db');
const { Intents } = require('discord.js');
const Client = require('./src/Client');

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;

const intents = new Intents();

intents.add(
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGES
);

const client = new Client({ intents });
client.init(token, guildId, clientId);
