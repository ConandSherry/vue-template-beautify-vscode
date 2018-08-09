// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const prettydiff = require('prettydiff2');
const compiler = require('vue-template-compiler');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const self = this;
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.vueTemplateBeautify', beautify);

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
function beautify() {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // No open text editor
    }
    let selection;
    let text = editor.document.getText();
    const firstLine = editor.document.positionAt(0);
    const lastLine = editor.document.positionAt(text.length - 1);
    selection = new vscode.Range(firstLine.line, firstLine.character, lastLine.line, lastLine.character);
    let parse = compiler.parseComponent(text);
    let configuration = vscode.workspace.getConfiguration('vueTemplateBeautify');
    let beautifiedText = prettydiff({
        source: parse.template.content,
        quoteConvert: configuration['quoteConvert'],
        wrap: configuration['wrap'],
        force_attribute: configuration['force_attribute'],
        mode: 'beautify'
    });
    text = text.slice(0, parse.template.start) + '\n' + beautifiedText + '\n' + text.slice(parse.template.end);
    editor.edit(edit => edit.replace(selection, text));
    // Display a message box to the user
}
