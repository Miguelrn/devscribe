import * as vscode from 'vscode';
import { HelloWorldPanel } from './HelloWorldPanel';

export function activate(context: vscode.ExtensionContext) {

	

	context.subscriptions.push(
		vscode.commands.registerCommand('vstodo.helloWorld', () => {
			HelloWorldPanel.createOrShow(context.extensionUri);
		})
	);


	context.subscriptions.push(
		vscode.commands.registerCommand('vstodo.askQuestion', async() => {
			const answer = await vscode.window.showInformationMessage(
				"How was your day?",
				"Good!",
				"Bad"
			);

			if(answer === "Bad"){
				vscode.window.showInformationMessage("Sorry to heard that");
			}
			else {
				vscode.window.showInformationMessage("Happy to heard that");
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
