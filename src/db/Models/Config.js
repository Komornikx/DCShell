const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
	guildId: { type: String, required: true },
	shellsCatId: { type: String, required: true },
});

module.exports = mongoose.model('GuildConfig', ConfigSchema);
