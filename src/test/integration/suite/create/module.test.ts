import { expect } from 'chai';
import { EditorView, VSBrowser, WebDriver } from 'vscode-extension-tester';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as tmp from 'tmp';
import { ProjectCreator } from '../../util/create';
import { dismissNotifications } from '../../util/common';

(process.env.JENKINS ? describe.skip : describe)('Module creation', function () {
	let browser: VSBrowser;
	let driver: WebDriver;
	let tempDirectory: tmp.DirResult;

	beforeEach(async function () {
		browser = VSBrowser.instance;
		driver = browser.driver;
		const editorView = new EditorView();
		await editorView.closeAllEditors();
		await browser.waitForWorkbench();
		tempDirectory = tmp.dirSync();
		await dismissNotifications();
	});

	afterEach(async function () {
		await fs.remove(tempDirectory.name);
	});

	it('should be able to create a module project', async function () {
		this.timeout(90000);

		const name = 'vscode-e2e-test-module';
		const creator = new ProjectCreator(driver);
		await creator.createModule({
			id: 'com.axway.e2e',
			folder: tempDirectory.name,
			name,
			platforms: [ 'android', 'ios' ]
		});

		const projectPath = path.join(tempDirectory.name, name);
		expect(fs.existsSync(projectPath)).to.equal(true);
		expect(fs.existsSync(path.join(projectPath, 'android'))).to.equal(true);
		expect(fs.existsSync(path.join(projectPath, 'ios'))).to.equal(true);
	});

	it('should only enable selected platforms', async function () {
		this.timeout(90000);

		const name = 'vscode-e2e-test-module';
		const creator = new ProjectCreator(driver);

		await creator.createModule({
			id: 'com.axway.e2e',
			folder: tempDirectory.name,
			name,
			platforms: [ 'android' ]
		});

		const projectPath = path.join(tempDirectory.name, name);
		expect(fs.existsSync(projectPath)).to.equal(true);
		expect(fs.existsSync(path.join(projectPath, 'android'))).to.equal(true);
		expect(fs.existsSync(path.join(projectPath, 'ios'))).to.equal(false);
	});
});
