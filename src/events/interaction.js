const Shell = require('../Shell');
const path = require('path');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.commandName) {
			console.log(interaction.commandName);
			const member = interaction.member;
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

						console.log(member.user);
						const newChannel = await guild.channels.create(
							`${member.user.username}-SHELL`,
							{
								type: 'GUILD_TEXT',
								parent: category.id,
								permissionOverwrites: [
									{
										id: guild.roles.everyone,
										deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
									},
									{
										id: member.id,
										allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT'],
									},
								],
							}
						);
						const startDir =
							process.env.START_DIR || path.join(require.main.filename, '..');

						interaction.editReply('Created!');
						newChannel.send(`<@${member.user.id}> Here!`);
						newChannel.send(`\`\`\`${startDir}\`\`\``);

						interaction.client.shells.push(
							new Shell(member.id, guild.id, newChannel, startDir)
						);
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
