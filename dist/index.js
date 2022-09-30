"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mimeType = require("mime-types");
const fs = require("fs");
const nodePath = require("path");
const buildImageSource = (t, imgPath) => {
    const fileMimeType = mimeType.lookup(imgPath);
    const data = fs.readFileSync(imgPath);
    const buff = Buffer.from(data).toString('base64');
    const base64 = 'data:' + fileMimeType + ';base64,' + buff;
    const dimensions = require('image-size')(imgPath);
    const source = t.objectExpression([
        t.objectProperty(t.identifier('uri'), t.stringLiteral(base64)),
        t.objectProperty(t.identifier('width'), t.numericLiteral(dimensions.width)),
        t.objectProperty(t.identifier('height'), t.numericLiteral(dimensions.height)),
    ]);
    return source;
};
const plugin = function (babel) {
    const t = babel.types;
    const LIMIT = 10 * 1024;
    const FILE_TEST = /\.(png|jpg|jpeg)$/;
    return {
        visitor: {
            CallExpression(ast, source) {
                const { opts: { limit = LIMIT, test = FILE_TEST }, file: { opts: { filename } } } = source;
                if (t.isIdentifier(ast.node.callee, { name: 'require' }) && ast.node.arguments.length === 1) {
                    if (t.isStringLiteral(ast.node.arguments[0]) && test.test(ast.node.arguments[0].value)) {
                        const resolveFilePath = filename.substring(0, filename.lastIndexOf("/") + 1);
                        const filePath = nodePath.resolve(resolveFilePath, ast.node.arguments[0].value);
                        const data = fs.readFileSync(filePath);
                        if (data.length < limit) {
                            const source = buildImageSource(t, filePath);
                            ast.replaceWith(source);
                        }
                    }
                }
            },
            ImportDeclaration(ast, source) {
                const { opts: { limit = LIMIT, test = FILE_TEST }, file: { opts: { filename } } } = source;
                if (test.test(ast.node.source.value)) {
                    const resolveFilePath = filename.substring(0, filename.lastIndexOf("/") + 1);
                    const filePath = nodePath.resolve(resolveFilePath, ast.node.source.value);
                    const data = fs.readFileSync(filePath);
                    if (data.length < limit) {
                        const source = buildImageSource(t, filePath);
                        ast.replaceWith(t.variableDeclaration("const", [
                            t.variableDeclarator(t.identifier(ast.node.specifiers[0].local.name), source)
                        ]));
                    }
                }
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=index.js.map