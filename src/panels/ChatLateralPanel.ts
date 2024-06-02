import { getNonce } from "../getNonce";
import { Uri, Webview, WebviewView, WebviewViewProvider, window } from "vscode";
import { ApiResponse } from "../utils/types";

export class ChatLateralPanel implements WebviewViewProvider {

    public static readonly viewType = 'llm-chat-lateral-view';
    _view?: WebviewView;
    private _isFocused: boolean = false;
    private context: {role: string, content: string}[] = [];
  
    constructor(private readonly _extensionUri: Uri) {}

    resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets")],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        //  wwebview to panel
        webviewView.webview.onDidReceiveMessage(async (data: {role: string, content: string}) => {
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

    public sendDataToWebview(data: {role: string, content: string}) {
		if (this._view) {
			this._view.show?.(true); 
			this._view.webview.postMessage(data);
            this.queryLlm(`Explain the following code: \n ${data.content}`);
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

    private async queryLlm(prompt: string) {
        const endpoint = 'http://localhost:11434/api/chat';
        this.context.push({role: 'user', content: prompt});
        const body = {
            model: 'codegemma',
            stream: false,
            keep_alive: '60m',
            messages: this.context
        };
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
        
            const responseData: ApiResponse = await response.json() as ApiResponse;
            const reply = responseData.message;

            this.context.push(reply);
            this._view?.webview.postMessage(reply);
        } catch (error) {
            console.error("Error making API call:", error);
            return null;
        }
    };
}