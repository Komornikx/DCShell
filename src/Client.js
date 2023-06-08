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
				console.log('Commands registered successfully!');
			} catch (err) {
				console.error(err);
			}
		})();

		this.on('messageCreate', async (msg) => {
			if (msg.author.bot) {
				return;
			}

			const shellId = msg.channelId;
			for (const shell of this.shells) {
				if (shell.channel.id == shellId) {
					//todo make a one interactable shell for multiple commands instead of creating a new shell at every command to make a live processes also interactable
					const shellProcess = spawn(`${msg.content}`, {
						cwd: shell.directory,
						shell: 'powershell.exe',
					});

					//! Change directory - fixes todo
					const lastDir = shell.directory;

					if (msg.content == 'cd..' || msg.content == 'cd ..') {
						shell.directory = path.join(shell.directory, '..');
					} else if (/^(cd) {0,1}.*/g.test(msg.content)) {
						shell.directory = path.join(
							shell.directory,
							msg.content.replace(/^(cd) ?/, '')
						);
					}

					let outputArr = [];

					shellProcess.stdout.on('data', async (data) => {
						const outputData = await data.toString().trim();
						outputArr.push(outputData);
					});

					shellProcess.stderr.on('data', async (data) => {
						const outputData = await data.toString().trim();
						outputArr.push(outputData);

						//!if it's a change dir command and dir doesn't exists return to previous dir
						shell.directory = lastDir;
					});

					let output = await Promise.race([
						new Promise((resolve) => {
							shellProcess.on('exit', () => {
								resolve({
									finished: true,
									txt: outputArr.join('\n'),
								});
							});
						}),
						new Promise((resolve) => {
							setTimeout(() => {
								resolve({ finished: false, txt: outputArr.join('\n') });
							}, 8000);
						}),
					]);

					if (output.finished) {
						while (output.txt.length > 0 && output.txt) {
							const send = output.txt.slice(0, 1950);
							output.txt = output.txt.substring(1950);

							shell.channel.send(`\`\`\`${send}\`\`\``);
						}
						shell.channel.send(`\`\`\`${shell.directory}\\\`\`\``);
					} else if (!output.finished) {
						//todo Create event listener using event emitter for shellProcess.stdout to send live output data
						const interval = setInterval(() => {
							if (outputArr.length <= 0) {
								return;
							}

							output.txt = outputArr.join('\n');
							outputArr = output.txt.substring(1950).split('\n');
							const send = output.txt.slice(0, 1950);
							output.txt = output.txt.substring(1950);

							if (!send) {
								return;
							}

							shell.channel.send(`\`\`\`${send}\`\`\``);
						}, 500);

						shellProcess.on('exit', () => {
							clearInterval(interval);
						});
					}
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
