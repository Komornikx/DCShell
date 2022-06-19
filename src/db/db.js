const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/DCShell';

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.once('open', () => {
	console.log('Connected with DB');
});

db.on('error', (err) => {
	console.err('DB Connection err');
});
