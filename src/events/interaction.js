const Shell = require('../Shell');
const { spawn } = require('child_process');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.commandName) {
			console.log(interaction.commandName);
			const user = interaction.member;
			const guild = interaction.guild;

			switch (interaction.commandName) {
				case 'ping': {
					const sent = await interaction.reply({
						content: 'Pinging...',
						fetchReply: true,
					});
					interaction.editReply(
						`ping ${sent.createdTimestamp - interaction.createdTimestamp}ms`
					);
					break;
				}
				case 'createshell': {
					await interaction.reply({
						content: 'Creating...',
						fetchReply: true,
						ephemeral: true,
					});

					try {
						let category = await guild.channels.cache
							.filter((el) => el.name == 'DCShells')
							.map((el) => el)[0];

						if (!category) {
							category = await guild.channels.create(`DCShells`, {
								type: 'GUILD_CATEGORY',
							});
						}

						const newChannel = await guild.channels.create(
							`${user.username}-SHELL`,
							{
								type: 'GUILD_TEXT',
								permissionOverwrites: [
									{
										id: guild.roles.everyone,
										deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
									},
									{
										id: user.id,
										allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'],
									},
								],
							}
						);
						newChannel.setParent(category.id);

						interaction.editReply('Created!');
						newChannel.send(`@${user.id} Here!`);
						await newChannel.send(`~/`);

						interaction.client.shells.push(
							new Shell(user.id, guild.id, newChannel.id)
						);
						interaction.client.on('messageCreate', async (msg) => {
							if (msg.author.bot) {
								return;
							}

							const shellProcess = spawn(msg.content, {
								shell: 'powershell.exe',
							});

							console.log(msg.content);

							const output = await new Promise((resolve) => {
								const outputArr = [];

								shellProcess.stdout.on('data', async (data) => {
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

							newChannel.send(output);

							shellProcess.stderr.on('data', (data) => {
								console.error(`stderr: ${data}`);
							});
						});
					} catch (err) {
						console.log(err);
						interaction.editReply('Error while creating a new shell');
					}
					break;
				}
				case 'closeshell': {
					await interaction.reply('Closing...');
					const channel = interaction.channel;
					interaction.client.closeShell(channel);
					break;
				}
				default: {
					interaction.reply('No command like that was set!', {
						ephemeral: true,
					});
					break;
				}
			}
		} else {
			interaction.reply('You can not send commands here!', { ephemeral: true });
		}
	},
};
