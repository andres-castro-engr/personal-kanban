import * as vscode from 'vscode';
import { parseMarkdownToBoard } from './parsers/parseMarkdownToBoard';
import { parseBoardToMarkdown } from './parsers/parseBoardToMarkdown';
import { getHtmlForWebview } from './webview/getHtmlForWebview';

export class KanbanEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new KanbanEditorProvider(context);
    return vscode.window.registerCustomEditorProvider('kanbanViewer.option', provider);
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true };

    // Asignar el HTML de la vista
    webviewPanel.webview.html = getHtmlForWebview(webviewPanel.webview, this.context.extensionUri);

    const updateWebview = () => {
      const text = document.getText();
      const boardData = parseMarkdownToBoard(text);
      webviewPanel.webview.postMessage({ type: 'LOAD_BOARD', data: boardData });
    };

    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'SAVE_BOARD':
          const markdownContent = parseBoardToMarkdown(message.data);
          this.updateDocument(document, markdownContent);
          return;
      }
    });

    // Suscribirse a cambios si el archivo se edita por fuera
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'out')
      ]
    };

    updateWebview();
  }

  private updateDocument(document: vscode.TextDocument, newContent: string) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      newContent
    );
    vscode.workspace.applyEdit(edit);
  }
}

// Punto de entrada de la extensión
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(KanbanEditorProvider.register(context));
}

export function deactivate() {}