const { spawn } = require('child_process');

const child = spawn('ls', { shell: 'powershell.exe' });

child.stdout.on('data', (data) => {
	console.log(data.toString().trim());
});
