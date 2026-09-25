import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const nonce = getNonce();

  // 1. Get URIs for static resources
  const stylesUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'styles.css')
  );
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'main.js')
  );

  // 2. Read HTML file
  let htmlFilePath = path.join(extensionUri.fsPath, 'out', 'webview', 'kanban.html');
  if (!fs.existsSync(htmlFilePath)) {
    htmlFilePath = path.join(extensionUri.fsPath, 'src', 'webview', 'kanban.html');
  }

  let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // 3. Replace placeholders in the HTML
  htmlContent = htmlContent.replace(/\${cspSource}/g, webview.cspSource);
  htmlContent = htmlContent.replace(/\${stylesUri}/g, stylesUri.toString());

  // Generate <script> tags for multiple webview files
  const scriptFiles = ['cards.js', 'columns.js', 'tags.js', 'core.js', 'modals.js', 'main.js', 'dragdrop.js', 'events.js'];
  const scriptTags = scriptFiles
    .map((f) => {
      let filePath = path.join(extensionUri.fsPath, 'out', 'webview', f);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(extensionUri.fsPath, 'src', 'webview', f);
      }
      const uri = webview.asWebviewUri(vscode.Uri.file(filePath));
      return `<script nonce="${nonce}" src="${uri.toString()}"></script>`;
    })
    .join('\n');

  htmlContent = htmlContent.replace(/\${scriptTags}/g, scriptTags);
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