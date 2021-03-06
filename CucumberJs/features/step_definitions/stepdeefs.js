const assert = require('assert');
const { Given, Then } = require('cucumber');

Given('I am testing extended debugging on webpage', async function test() {
	await this.browser.url('https://www.saucedemo.com/');
	const username = await this.browser.$('[data-test="username"]');
	await username.setValue(process.env.PERF_USERNAME || 'standard_user');
	const password = await this.browser.$('[data-test="password"]');
	await password.setValue('secret_sauce');
	const login = await this.browser.$('.login-button');
	await login.click();
	await this.browser.url('https://www.saucedemo.com/inventory.html');
});

Then('I check for sauce:network logs', async function test() {
	const network = await this.browser.getLogs('sauce:network');
	const isRequestExists = network.some(req => req.url.includes('main.js'));
	assert.strictEqual(isRequestExists, true);
});

Then('I check for sauce:metrics logs', async function test() {
	const metrics = await this.browser.getLogs('sauce:metrics');
	const pageLoadTime = metrics.domContentLoaded - metrics.navigationStart;
	assert.ok(pageLoadTime <= 5, `Expected page load time to be lower than 5s but was ${pageLoadTime}s`);
});

Then('I check for sauce:timing logs', async function test() {
	const timing = await this.browser.getLogs('sauce:timing');
	assert.ok('domLoading' in timing, 'domLoading is missing');
});

Then('I check for sauce:performance logs', async function test() {
	const performanceLogs = await this.browser.getLogs('sauce:performance');
	const metrics = [
		'load',
		'speedIndex',
		'pageWeight',
		'pageWeightEncoded',
		'timeToFirstByte',
		'timeToFirstInteractive',
		'firstContentfulPaint',
		'perceptualSpeedIndex',
		'domContentLoaded',
	];
	metrics.forEach(metric => assert.ok(metric in performanceLogs, `${metric} metric is missing`));
});

Then('I assert that pageLoad is not degraded using sauce:performance custom command', async function test() {
	const output = await this.browser.execute('sauce:performance', {
		name: this.testName,
		metrics: ['load'],
	});
	assert.equal(output.result, 'pass', output.reason);
});

Then('I assert that pageWeight is not degraded using sauce:performance custom command', async function test() {
	const output = await this.browser.execute('sauce:performance', {
		name: this.testName,
		metrics: ['pageWeight'],
	});
	assert.equal(output.result, 'pass', output.reason);
});
