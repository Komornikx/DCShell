const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong!'),
	new SlashCommandBuilder()
		.setName('createshell')
		.setDescription('Creates a new shell process'),
	new SlashCommandBuilder()
		.setName('closeshell')
		.setDescription('Close current shell'),
].map((command) => command.toJSON());

module.exports = commands;
