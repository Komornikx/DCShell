class Shell {
	constructor(uId, guildId, channel, directory) {
		this.uId = uId;
		this.guildId = guildId;
		this.channel = channel;

		this.directory = directory;
		this.output = [];
	}
}

module.exports = Shell;
