const commands = require('../src/commands');

describe('bot-commands', () => {
	test('should create arr of commands objects', () => {
		expect(commands).toEqual(
			expect.arrayContaining([expect.objectContaining({ name: 'ping' })])
		);
	});
});
