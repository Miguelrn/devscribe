import { commands, DecorationOptions, ExtensionContext, MarkdownString, Range, TextEditorDecorationType, TextEditorSelectionChangeEvent, Uri, window } from 'vscode';
import { ChatLateralPanel } from './panels/ChatLateralPanel';
import path from 'path';

let decorationType: TextEditorDecorationType | undefined;
let chatLateralPanel: ChatLateralPanel;

export function activate(context: ExtensionContext) {
    
	chatLateralPanel = new ChatLateralPanel(context.extensionUri);

	context.subscriptions.push(
		window.registerWebviewViewProvider(
			ChatLateralPanel.viewType,
			chatLateralPanel,
		)
	);

	context.subscriptions.push(
		commands.registerCommand('llm.chat', async () => {
			await chatLLM('You are a helpful assistant.');
		})
	);

	context.subscriptions.push(
		commands.registerCommand('llm.explain', async () => {
			await chatLLM(`User will provide a code snippet. Your task is to explain the meaning of the code in detail. Focus on describing what the code is doing, how it works, and its purpose. If possible, suggest improvements or refactors, but the primary goal is to provide a clear and concise explanation of the code\'s functionality.`); 
		})
	);

	context.subscriptions.push(
		commands.registerCommand('llm.refactor', async () => {
			await chatLLM(`User will provide a code snippet. Your task is to suggest possible refactoring for the top or most external function in the snippet to improve its readability, performance, or maintainability. Focus on this primary function rather than internal or nested functions. If no significant refactor is needed, suggest potential improvements or optimizations.`); 
		})
	);

	context.subscriptions.push(
		commands.registerCommand('llm.doc', async () => {
			await chatLLM(`User will provide a code snippet containing one or more functions. Your task is to create inline documentation for only the top-level or most external function. Focus on describing the function's purpose, parameters, and return values. Add brief inline comments only if necessary to explain complex parts of the code. Follow the documentation style of the language used.`); 
		})
	);
	
	context.subscriptions.push(
		commands.registerCommand('llm.completion', async () => {
			await chatLLM(`User will provide a partially written code snippet. Your task is to analyze the snippet and, if it is incomplete, provide the necessary code to complete it. If the code is already complete and no additional lines or logic are needed, return nothing. Focus on making sure the code is syntactically correct and logically coherent. Use the conventions and style appropriate to the programming language of the provided code snippet.`); 
		})
	);
	// display icon
	// context.subscriptions.push(window.onDidChangeTextEditorSelection((e) => getSelection(e,context)));
	context.subscriptions.push({
       dispose: () => {
           if (decorationType) {
               decorationType.dispose();
           }
       }
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}

const chatLLM = async (systemPrompt: string) => {
	const {activeTextEditor} = window;

	if(!activeTextEditor){
		window.showInformationMessage("no active selection");
		return;
	}

	const text = activeTextEditor.document.getText(activeTextEditor.selection);
	// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts
	// https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-cli-sample
	if(!chatLateralPanel.isFocused()){
		// if the panel was not visible need to initialize wait a bit and then send msg (will recive nothing without this waiting)
		commands.executeCommand('workbench.view.extension.llm-chat-lateral-view');
		await setTimeout(() => {
			sendMsg(text, systemPrompt);
		}, 1000);
		
	}
	else {
		sendMsg(text, systemPrompt);
	}
};

const getSelection = (event: TextEditorSelectionChangeEvent, context: ExtensionContext) => {
	const editor = event.textEditor;
    const selection = editor.selection;

        // Only show the icon if there is a non-empty selection
	if (!selection.isEmpty) {
		const selectionRange: Range = selection;

		// Remove existing decoration if any
		if (decorationType) {
			editor.setDecorations(decorationType, []);
		}

		decorationType = window.createTextEditorDecorationType({});
		const content = new MarkdownString(`<img src="favicon144.png" width=144 height=144/>`);
		content.supportHtml = true;
		content.isTrusted = true;
		content.baseUri = Uri.file(path.join(context.extensionPath, './media', 'copilot-menu.svg'));          
	
		// return new Hover(content, new vscode.Range(position, position));

		const hoverMessage = new MarkdownString(`[<img src="copilot-menu.svg" width=64 height=64 />](command:llm.chat)`);
		hoverMessage.isTrusted = true;
		hoverMessage.supportHtml = true;
		hoverMessage.baseUri = Uri.file(path.join(context.extensionPath, 'media', '\\'));          

		const decorationOptions: DecorationOptions[] = [
			{
				range: selectionRange,
				hoverMessage: hoverMessage,
			}
		];

		// Apply the decoration to the selected range
		editor.setDecorations(decorationType, decorationOptions);
	} else {
		// Clear the decoration if the selection is empty
		if (decorationType) {
			editor.setDecorations(decorationType, []);
		}
	}

};

const sendMsg = (text: string, system: string) => {
	const language = window.activeTextEditor?.document.languageId || 'plain';
	chatLateralPanel.sendDataToWebview({
		role: 'user',
		content: "```" + language + "\n" + text + "\n```",
		done: true,
		system: system
	});
};

