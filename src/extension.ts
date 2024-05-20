import {CancellationToken, CodeAction, CodeActionKind, CodeActionProvider, CodeLens, CodeLensProvider, commands, Comment, CommentAuthorInformation, CommentMode, CommentReply, comments, CommentThread, CommentThreadCollapsibleState, CompletionContext, CompletionItem, CompletionItemKind, DecorationOptions, Diagnostic, DiagnosticCollection, DiagnosticSeverity, Disposable, DocumentLink, DocumentLinkProvider, DocumentSymbol, env, EventEmitter, ExtensionContext, languages, Location, MarkdownString, Position, Range, SnippetString, StatusBarAlignment, StatusBarItem, TextDocument, TextDocumentContentProvider, TextEditor, TextEditorDecorationType, TextEditorSelectionChangeEvent, TextLine, Uri, window, workspace, WorkspaceEdit} from 'vscode';
import { ChatLateralPanel } from './panels/ChatLateralPanel';
import path from 'path';

let decorationType: TextEditorDecorationType | undefined;
let selectionRange: Range | undefined;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    
	const chatLateralPanel = new ChatLateralPanel(context.extensionUri);

	context.subscriptions.push(
		window.registerWebviewViewProvider(
			ChatLateralPanel.viewType,
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
			// window.showInformationMessage(text);
			if(!chatLateralPanel.isFocused()){
				commands.executeCommand('workbench.view.extension.llm-chat-lateral-view');
			}
			chatLateralPanel.sendDataToWebview({
				type: 'explain',
				value: text,
				language: window.activeTextEditor?.document.languageId || 'plain' // TODO whats the name of no language?
			});
		})
	);
	// comment sample add a column with a icon --> trigger action?
	// cosa nueva
	// editor.document.languageId!!!

	// register some listener that make sure the status bar 
	// item always up-to-date

	

	// let disposable = commands.registerCommand('llm.showContextMenu', async () => {
    //     if (selectionRange) {
    //         const editor = window.activeTextEditor;
    //         if (editor) {
    //             const document = editor.document;
    //             const selectionText = document.getText(selectionRange);

    //             window.showInformationMessage(`Contextual Menu for: ${selectionText}`, 'Extract Context').then(selection => {
    //                 if (selection === 'Extract Context' && selectionRange) {
    //                     extractContext(selectionRange);
    //                 }
    //             });
    //         }
    //     }
    // });
	// context.subscriptions.push(disposable); //todo surronding



	// context.subscriptions.push(window.onDidChangeActiveTextEditor(async () => await getNumberOfSelectedLines(window.activeTextEditor)));
	context.subscriptions.push(window.onDidChangeTextEditorSelection((e) => getSelection(e,context)));
	context.subscriptions.push({
        dispose: () => {
            if (decorationType) {
                decorationType.dispose();
            }
        }
    });

	// update status bar item once at start
	// getNumberOfSelectedLines(window.activeTextEditor);
}

// This method is called when your extension is deactivated
export function deactivate() {}


function getSelection(event: TextEditorSelectionChangeEvent, context: ExtensionContext) {
	const editor = event.textEditor;
    const selection = editor.selection;

        // Only show the icon if there is a non-empty selection
	if (!selection.isEmpty) {
		selectionRange = selection;

		// Remove existing decoration if any
		if (decorationType) {
			editor.setDecorations(decorationType, []);
		}

		// Create a decoration with an icon
		const iconPath = Uri.file(path.join(context.extensionPath, './media', 'copilot-menu.svg'));
		decorationType = window.createTextEditorDecorationType({
			// after: {
			// 	contentIconPath: iconPath, // Icon representation (can be customized)
			// 	margin: '0 0 0 1rem',
			// 	// contentIconPath: '/media/copilot.svg'
			// 	// cursor: 'pointer'
			// }
		});
		const content = new MarkdownString(`<img src="favicon144.png" width=144 height=144/>`);
		content.supportHtml = true;
		content.isTrusted = true;
		content.baseUri = Uri.file(path.join(context.extensionPath, './media', 'copilot-menu.svg'));          
	
		// return new Hover(content, new vscode.Range(position, position));

		const hoverMessage = new MarkdownString(`[<img src="copilot-menu.svg" width=64 height=64/>](command:llm.chat)`, true);
		hoverMessage.isTrusted = true;
		hoverMessage.supportHtml = true;
		hoverMessage.baseUri = Uri.file(path.join(context.extensionPath, 'media', '\\'));          

		const decorationOptions: DecorationOptions[] = [
			{
				range: selectionRange,
				hoverMessage: hoverMessage,
				renderOptions: {
					dark: {

					}
					// after: {
					// 	contentIconPath: iconPath, // Add extra space to ensure enough area for clicking
					// 	width: '16px',
					// 	height: '16px',
					// }
				}
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

}

function findSymbolAtPosition(symbols: DocumentSymbol[], position: Position): DocumentSymbol | null {
    for (const symbol of symbols) {
        if (symbol.range.contains(position)) {
            // Check if the symbol has children (e.g., nested functions or methods)
            const foundInChildren = findSymbolAtPosition(symbol.children, position);
            return foundInChildren || symbol;
        }
    }
    return null;
}

async function extractContext(range: Range): Promise<string> {
	let text = '';
	const editor = window.activeTextEditor;
	if (editor) {
		// Get the cursor position
		const position = editor.selection.active;
		const document = editor.document;

		// Find the symbol at the cursor position using the DocumentSymbolProvider
		const symbols = await commands.executeCommand<DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri);

		if (symbols) {
			const symbol = findSymbolAtPosition(symbols, position);
			if (symbol) {
				text = document.getText(symbol.range);
				// window.showInformationMessage(`Function text: ${functionText}`);
			} else {
				text = 'else 1';
				// window.showInformationMessage('No function or method found at the cursor position.');
			}
		} else {
			text = 'else 2';
			// window.showInformationMessage('No symbols found in the document.');
		}
	}
	return text;
}