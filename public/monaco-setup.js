
window.onload = function () {
    require(['vs/editor/editor.main'], function () {
        window.monacoEditor = monaco.editor.create(document.getElementById('editor-container'), {
            value: `// Example: Change cube color\ncontext.changeColor(0x00ff00);\n\n// Example: Rotate cube\ncontext.rotateCube(0.05);`,
            language: "javascript",
            theme: "vs-dark"
        });
    });
};

