const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Client } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = require('./commands');

class client extends Client {
	constructor(options) {
		super(options);
		this.shells = [];
	}

	async init(token, guildId, clientId) {
		await this.login(token);
		this.#registerCommands(token, guildId, clientId);
		this.#loadEvents();
		this.closeAllShells();
	}

	/**
	 *
	 * @param {Object} channel
	 */
	async closeShell(channel) {
		this.shells = this.shells.filter((el) => el.channelId != channel.id);
		channel.delete();
	}

	async closeAllShells() {
		//* All guild loop - fetch guild config and remove i usuwaj channels with shells

		const guilds = (await this.guilds.fetch()).map((el) => el.id);
		for (const guildId of guilds) {
			//* DB CONFIG
			const guild = this.guilds.cache.get(guildId);

			const category = guild.channels.cache
				.map((el) => el)
				.find((el) => el.name == 'DCShells');

			const shellChannels = await guild.channels.cache
				.map((el) => el)
				.filter((el) => el.parentId == category.id);

			for (const channel of shellChannels) {
				channel.delete();
			}
		}
	}

	/**
	 * Register commands which are set inside ./commands.js file
	 * @param {String} token
	 * @param {String} guildId
	 * @param {String} clientId
	 */
	async #registerCommands(token, guildId, clientId) {
		const rest = new REST({ version: '9' }).setToken(token);
		(async () => {
			try {
				await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
					body: commands,
				});
				console.log('commands registered successfully!');
			} catch (err) {
				console.error(err);
			}
		})();

		this.on('messageCreate', async (msg) => {
			if (msg.author.bot) {
				return;
			}
			// console.log(msg);

			const shellId = msg.channelId;
			for (const shell of this.shells) {
				if (shell.channel.id == shellId) {
					const shellProcess = spawn(`${msg.content}`, {
						cwd: shell.directory,
						shell: 'powershell.exe',
					});

					const output = await new Promise((resolve) => {
						const outputArr = [];

						shellProcess.stdout.on('data', async (data) => {
							const output = await data.toString().trim();
							outputArr.push(output);
						});

						shellProcess.stderr.on('data', async (data) => {
							const output = await data.toString().trim();
							outputArr.push(output);
						});

						shellProcess.on('exit', () => {
							resolve(outputArr.join(''));
						});
					});

					if (!output) {
						return;
					}
					shell.channel.send(`\`\`\`${output}\`\`\``);
				}
			}
		});
	}

	/**
	 * Loading event files from ./events dir
	 */
	async #loadEvents() {
		const eventsPath = path.join(__dirname, 'events');
		const eventsFiles = (await fs.promises.readdir(eventsPath)).filter((file) =>
			file.endsWith('js')
		);

		for (const file of eventsFiles) {
			const filePath = path.join(eventsPath, file);
			const event = require(filePath);
			if (!event.disable) {
				if (event.once) {
					this.once(event.name, (...args) => event.execute(...args));
				} else {
					this.on(event.name, (...args) => event.execute(...args));
				}
			}
		}
	}
}

module.exports = client;
