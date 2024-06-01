import { getNonce } from "../getNonce";
import { Uri, Webview, WebviewView, WebviewViewProvider, window } from "vscode";

export class ChatLateralPanel implements WebviewViewProvider {

    public static readonly viewType = 'llm-chat-lateral-view';
    _view?: WebviewView;
    private _isFocused: boolean = false;
    // _doc?: TextDocument;
  
    constructor(private readonly _extensionUri: Uri) {}

    resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [Uri.joinPath(this._extensionUri, "webview-ui", "build", "assets")],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data: {type: string, value: string}) => {
            switch (data.type) {
                case "onInfo": 
                    if (!data.value) {
                        return;
                    }
                    window.showInformationMessage(data.value);
                    break;
                case "onError": 
                    if (!data.value) {
                        return;
                    }
                    window.showErrorMessage(data.value);
                    break;
                case "explain": 
                    if (!data.value) {
                        return;
                    }
                    window.showErrorMessage(data.value);
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

    public sendDataToWebview(data: {type: string, value: string, language: string}) {
		if (this._view) {
			this._view.show?.(true); 
			this._view.webview.postMessage(data);
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
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

}