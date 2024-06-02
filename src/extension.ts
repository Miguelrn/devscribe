import { commands, DecorationOptions, ExtensionContext, MarkdownString, Range, TextEditorDecorationType, TextEditorSelectionChangeEvent, Uri, window } from 'vscode';
import { ChatLateralPanel } from './panels/ChatLateralPanel';
import path from 'path';
import { ApiResponse } from './utils/types';

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
			const {activeTextEditor} = window;

			if(!activeTextEditor){
				window.showInformationMessage("no active selection");
				return;
			}

			const text = activeTextEditor.document.getText(activeTextEditor.selection);
			// https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts
			if(!chatLateralPanel.isFocused()){
				// if the panel was not visible need to initialize wait a bit and then send msg (will recive nothing without this waiting)
				commands.executeCommand('workbench.view.extension.llm-chat-lateral-view');
				await setTimeout(() => {
					sendMsg(text);
				}, 1000);
				
			}
			else {
				sendMsg(text);
			}
		})
	);
	
	context.subscriptions.push(window.onDidChangeTextEditorSelection((e) => getSelection(e,context)));
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

const sendMsg = (text: string) => {
	const language = window.activeTextEditor?.document.languageId || 'plain';
	chatLateralPanel.sendDataToWebview({
		role: 'user',
		content: "Explain:\n```" + language + "\n" + text + "\n```"
	});
};

