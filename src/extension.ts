// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {commands, ExtensionContext, StatusBarAlignment, window} from 'vscode';
import { ChatPanel } from './panels/ChatPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    
	const item = window.createStatusBarItem(StatusBarAlignment.Right);
	item.text = '$(copilot) Add Todo';
	item.command = 'vstodo.addTodo';
	item.show();

    const showChatPanelCommand = commands.registerCommand("llm.chat", () => {
		ChatPanel.render(context.extensionUri);
	});

	// Add command to the extension context
	context.subscriptions.push(showChatPanelCommand);

}

// This method is called when your extension is deactivated
export function deactivate() {}
