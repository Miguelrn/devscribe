import { getNonce } from "../getNonce";
import { languages, Uri, Webview, WebviewView, WebviewViewProvider, window, workspace } from "vscode";

export class ChatLateralPanel implements WebviewViewProvider {

    public static readonly viewType = 'llm-chat-lateral-view';
    _view?: WebviewView;
    private _isFocused: boolean = false;
    private context: {role: string, content: string}[] = [];
    private config = workspace.getConfiguration('llm');
  
    constructor(private readonly _extensionUri: Uri) {

    }

    resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets")],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        //  wwebview to panel
        webviewView.webview.onDidReceiveMessage(async (data: {role: string, content: string, language?: string}) => {
            switch (data.role) {
                case "onInfo": 
                    if (!data.content) {
                        return;
                    }
                    window.showInformationMessage(data.content);
                    break;
                case "onError": 
                    if (!data.content) {
                        return;
                    }
                    window.showErrorMessage(data.content);
                    break;
                case "user": 
                    if (!data.content) {
                        return;
                    }
                    await this.queryLlm(data.content);
                    break;
                case "insertCode":
                    if(!data.content) {return;}
                    // commands.executeCommand('workbench.view.extension.llm-chat-lateral-view');

                    const editor = window.activeTextEditor;

                    if (editor) { // Insert text at current cursor position
                        editor.edit((editBuilder: { insert: (arg0: any, arg1: string) => void; }) => {
                            editBuilder.insert(editor.selection.active, data.content);
                        });
                    }
                    else { // create a nenw file and insert there
                        const workspacePath = workspace.rootPath; // Get the root workspace path
                        if (workspacePath) {
                            const uri = Uri.joinPath(Uri.file(workspacePath), 'scratch');
                            
                            workspace.fs.writeFile(uri, Buffer.from(data.content, 'utf8')).then(() => {
                                workspace.openTextDocument(uri).then((document: any) => {
                                    window.showTextDocument(document).then(() => {
                                        // Set language mode for the new document
                                        languages.setTextDocumentLanguage(document, data.language || 'plaintext');
                                    });
                                });
                            });
                        }
                    }
                    break;
            }
        });
        
        webviewView.onDidChangeVisibility(() => {
            this._isFocused = webviewView.visible;
        });

        this._isFocused = true;
    }

    revive(panel: WebviewView) {
        this._view = panel;
    }

    isFocused(): boolean {
        return this._isFocused;
    }

    public sendDataToWebview(data: {role: string, content: string, done: boolean, system?: string}) {
		if (this._view) {
			this._view.show?.(true); 
			this._view.webview.postMessage(data);
            this.queryLlm(data.content, data.system);
		}
	}

    private _getHtmlForWebview(webview: Webview) {
        // The CSS file from the React build output
        const stylesUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets", "index.css")
        );
        // The JS file from the React build output
        const scriptUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets", "index.js")
        );

        const nonce = getNonce();
  
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <title>Hello World</title>
            </head>
            <body>
                <div id="root"></div>
                <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    private async queryLlm(userPrompt: string, systemPrompt: string = 'You are a helpful assistant.') {

        const TEMPLATE = `{{ if .System }}system
                            {{ .System }}
                            {{ end }}{{ if .Prompt }}user
                            {{ .Prompt }}
                            {{ end }}assistant`;

        const prompt = TEMPLATE.replace('{{ if .System }}', systemPrompt ? 'system\n' + systemPrompt + '\n' : '')
                                .replace('{{ end }}', systemPrompt ? '' : '')
                                .replace('{{ if .Prompt }}', userPrompt ? 'user\n' + userPrompt + '\n' : '')
                                .replace('{{ end }}', userPrompt ? '' : '');

        console.log(prompt);

        const endpoint: string = this.config.get('url') || '';
        const model: string = this.config.get('model') || '';
        const token: string = this.config.get('token') || '';
        // const endpoint = 'http://localhost:11434/api/chat';
        this.context.push({role: 'user', content: prompt});
        const body = {
            model: model,
            stream: true,
            keep_alive: '60m',
            messages: this.context
        };
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token // TODO what happen if null ?
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const reply = { role: 'assistant', content: '', done: false};

            while (reader) {
                const { done, value } = await reader.read();
                if (done) {
                    this._view?.webview.postMessage({role: 'assistant', content: '', done});
                    break;
                }
        
                // Decode the chunk and process it
                const chunk = decoder.decode(value, { stream: true });
                const msg = JSON.parse(chunk).message;
                this._view?.webview.postMessage({...msg, done});

                reply.content += msg.content;
                reply.done = done;
            }

            this.context.push(reply);
        } catch (error) {
            console.error("Error making API call:", error);
            return null;
        }
    };
}