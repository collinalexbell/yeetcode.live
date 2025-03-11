window.onload = function () {
    require(['vs/editor/editor.main'], function () {
        const scriptSelector = document.getElementById('script-selector');
        const newScriptBtn = document.getElementById('new-script-btn');

        // Default script content
        const defaultScript = `// Example: Change cube color
context.changeColor(0x00ff00);

// Example: Rotate cube
context.rotateCube(0.05);`;

        // Load scripts from local storage or set default
        let scripts = JSON.parse(localStorage.getItem('scripts')) || { "default": defaultScript };

        // Function to update script selector dropdown
        function updateScriptSelector() {
            scriptSelector.innerHTML = '';
            Object.keys(scripts).forEach(scriptName => {
                let option = document.createElement('option');
                option.value = scriptName;
                option.textContent = scriptName;
                scriptSelector.appendChild(option);
            });
        }

        // Create Monaco Editor
        window.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: scripts["default"], // Load default script
            language: "javascript",
            theme: "vs-dark"
        });

        // Populate script selector dropdown
        updateScriptSelector();

        // Handle script selection change
        scriptSelector.addEventListener('change', function () {
            const selectedScript = scriptSelector.value;
            window.monacoEditor.setValue(scripts[selectedScript]);
        });

        // Handle "New Script" button click
        newScriptBtn.addEventListener('click', function () {
            const newScriptName = prompt("Enter new script name:");
            if (!newScriptName || scripts[newScriptName]) return;

            // Copy current script to new one
            scripts[newScriptName] = window.monacoEditor.getValue();
            localStorage.setItem('scripts', JSON.stringify(scripts));
            updateScriptSelector();

            // Select new script
            scriptSelector.value = newScriptName;
            window.monacoEditor.setValue(scripts[newScriptName]);
        });

        // Save scripts when editing
        window.monacoEditor.onDidChangeModelContent(() => {
            const currentScript = scriptSelector.value;
            scripts[currentScript] = window.monacoEditor.getValue();
            localStorage.setItem('scripts', JSON.stringify(scripts));
        });

        // Save to local storage when switching scripts
        scriptSelector.addEventListener('change', function () {
            const previousScript = scriptSelector.value;
            scripts[previousScript] = window.monacoEditor.getValue();
            localStorage.setItem('scripts', JSON.stringify(scripts));
        });
    });
};

