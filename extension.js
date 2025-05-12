const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

async function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.pasteAsFile', async (uri) => {
        try {
            const clipboard = await vscode.env.clipboard.readText();
            if (!clipboard.trim()) {
                vscode.window.showWarningMessage('Clipboard is empty.');
                return;
            }

            const lines = clipboard.split(/\r?\n/);
            const firstLine = lines[0].trim();

            // 提取形如 "# main.py" 的文件名
            const match = firstLine.match(/^#\s*([\w\-]+\.(\w+))/);
            if (!match) {
                vscode.window.showErrorMessage('第一行格式应为 "# filename.py"');
                return;
            }

            const filename = match[1];
            const folderPath = uri?.fsPath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

            if (!folderPath) {
                vscode.window.showErrorMessage('未找到有效目录来创建文件');
                return;
            }

            const filePath = path.join(folderPath, filename);
            if (fs.existsSync(filePath)) {
                vscode.window.showErrorMessage(`文件已存在: ${filename}`);
                return;
            }

            fs.writeFileSync(filePath, clipboard);
            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc);
        } catch (err) {
            vscode.window.showErrorMessage('发生错误: ' + err.message);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};