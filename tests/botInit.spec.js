require('dotenv').config();
const { Intents } = require('discord.js');
const Client = require('../src/Client');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;

describe('botInit', () => {
	test('check all .env variables are set', async () => {
		expect(token).toBeTruthy();
		expect(guildId).toBeTruthy();
		expect(clientId).toBeTruthy();
	});

	client.login(token);

	test('try to login to your bot app using .env variables', async () => {
		expect(client).toBeTruthy();
	});
});
