import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const nonce = getNonce();

  // 1. Obtener URIs de recursos estáticos
  const stylesUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'styles.css')
  );
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'main.js')
  );

  // 2. Leer archivo HTML
  let htmlFilePath = path.join(extensionUri.fsPath, 'out', 'webview', 'kanban.html');
  if (!fs.existsSync(htmlFilePath)) {
    htmlFilePath = path.join(extensionUri.fsPath, 'src', 'webview', 'kanban.html');
  }

  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // 3. Reemplazar placeholders en el HTML
  htmlContent = htmlContent.replace(/\${cspSource}/g, webview.cspSource);
  htmlContent = htmlContent.replace(/\${stylesUri}/g, stylesUri.toString());
  htmlContent = htmlContent.replace(/\${scriptUri}/g, scriptUri.toString());
  htmlContent = htmlContent.replace(/\${nonce}/g, nonce);

  return htmlContent;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}