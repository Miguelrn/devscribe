import {commands, ExtensionContext, StatusBarAlignment, window} from 'vscode';
import { ChatLateralPanel } from './panels/ChatLateralPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    
	const chatLateralPanel = new ChatLateralPanel(context.extensionUri);
	// const item = window.createStatusBarItem(StatusBarAlignment.Right);
	// item.text = '$(copilot) Add Todo';
	// item.command = 'vstodo.addTodo';
	// item.show();

	context.subscriptions.push(
		window.registerWebviewViewProvider(
			"llm-chat-lateral-view",
			chatLateralPanel
		)
	);

	context.subscriptions.push(
		commands.registerCommand('llm.chat', () => {
			const {activeTextEditor} = window;

			if(!activeTextEditor){
				window.showInformationMessage("no active selection");
				return;
			}

			const text = activeTextEditor.document.getText(activeTextEditor.selection);
			// vscode.window.showInformationMessage("text: " + text);

			// chatLateralPanel._view?.webview.postMessage({
			// 	type: 'new-todo',
			// 	value: text
			// });
		})
	);

	context.subscriptions.push(
		commands.registerCommand('vstodo.refresh', async () => {
			// HelloWorldPanel.kill();
			// HelloWorldPanel.createOrShow(context.extensionUri);
			await commands.executeCommand("workbench.action.closeSidebar");
			await commands.executeCommand("workbench.view.extension.vstodo-sidebar-view");
			// setTimeout(() => {// opens dev tools to inspect / debug :D
			// 	vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
			// }, 500);
		})
	);

    // https://github.com/microsoft/vscode-extension-samples/tree/main/code-actions-sample
	// https://github.com/microsoft/vscode-extension-samples/tree/main/authenticationprovider-sample

	// Add command to the extension context
	// context.subscriptions.push(
	// 	commands.registerCommand("llm.chat", () => {
	// 		ChatPanel.render(context.extensionUri);
	// 	})
	// );

}

// This method is called when your extension is deactivated
export function deactivate() {}
