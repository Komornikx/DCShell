const Shell = require('../Shell');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.commandName) {
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

						interaction.client.shells.push(new Shell(user.id));
						interaction.editReply('Created!');
						newChannel.send(`@${user.id} Here!`);
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
