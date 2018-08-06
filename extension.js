// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const prettydiff = require('prettydiff2');

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

    let newTextArr = [];
    ['html', 'js', 'css'].forEach(function(type) {
        let newText;
        newText = replaceText(text, type);
        return newTextArr.push(newText);
    });
    editor.edit(edit => edit.replace(selection, newTextArr.join('\n')));
    // Display a message box to the user
}
function replaceText(text, type) {
    let annotationRex, beautifiedText, beautify, contentRex, regObj, typeArr, typeContent, typeText, typeTextCon;
    regObj = {
        html: /(<!--\s*)?<template(\s|\S)*>(\s|\S)*<\/template>(\s*-->)?/gi,
        css: /(<!--\s*)?<style(\s|\S)*>(\s|\S)*<\/style>(\s*-->)?/gi,
        js: /(<!--\s*)?<script(\s|\S)*>(\s|\S)*<\/script>(\s*-->)?/gi
    };
    beautify = {
        html: prettydiff
    };
    if (!regObj[type].exec(text)) {
        return '';
    }
    regObj[type].lastIndex = 0;
    typeText = regObj[type].exec(text)[0];
    if (!typeText) {
        return '';
    }
    contentRex = />(\s|\S)*<\//g;
    typeTextCon = contentRex.exec(typeText)[0];
    typeContent = typeTextCon.substring(1).substr(0, typeTextCon.length - 3);
    typeArr = typeText.split(typeContent);
    if (type === 'html') {
        annotationRex = /^(<!--)(\s|\S)*(-->)$/gi;
        if (annotationRex.test(typeText)) {
            return typeText;
        }

        let configuration = vscode.workspace.getConfiguration('vueTemplateBeautify');
        beautifiedText = beautify[type]({
            source: typeContent,
            quoteConvert: configuration['quoteConvert'],
            wrap: configuration['wrap'],
            force_attribute: configuration['force_attribute'],
            mode: 'beautify'
        });

        return typeArr[0] + '\n' + beautifiedText + '\n' + typeArr[1];
    } else {
        return typeText;
    }
}
