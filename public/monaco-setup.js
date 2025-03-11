window.onload = function () {
    require(['vs/editor/editor.main'], function () {
        const scriptSelector = document.getElementById('script-selector');
        const newScriptBtn = document.getElementById('new-script-btn');

        async function loadDefaultScripts() {
            try {
                const response = await fetch('default-scripts.json');
                const defaultScripts = await response.json();

                // Only overwrite local storage if no scripts exist
                if (!localStorage.getItem('scripts')) {
                    localStorage.setItem('scripts', JSON.stringify(defaultScripts));
                }

                return JSON.parse(localStorage.getItem('scripts'));
            } catch (error) {
                console.error("Failed to load default scripts:", error);
                return { "default": "// Default script could not be loaded." };
            }
        }

        // Initialize scripts
        loadDefaultScripts().then(scripts => {
            function updateScriptSelector() {
                scriptSelector.innerHTML = '';
                Object.keys(scripts).forEach(scriptName => {
                    let option = document.createElement('option');
                    option.value = scriptName;
                    option.textContent = scriptName;
                    scriptSelector.appendChild(option);
                });
            }

            window.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
                value: scripts["default"] || "// No script found.",
                language: "javascript",
                theme: "vs-dark"
            });

            updateScriptSelector();

            scriptSelector.addEventListener('change', function () {
                const selectedScript = scriptSelector.value;
                window.monacoEditor.setValue(scripts[selectedScript]);
            });

            newScriptBtn.addEventListener('click', function () {
                const newScriptName = prompt("Enter new script name:");
                if (!newScriptName || scripts[newScriptName]) return;

                scripts[newScriptName] = window.monacoEditor.getValue();
                localStorage.setItem('scripts', JSON.stringify(scripts));
                updateScriptSelector();

                scriptSelector.value = newScriptName;
                window.monacoEditor.setValue(scripts[newScriptName]);
            });

            window.monacoEditor.onDidChangeModelContent(() => {
                const currentScript = scriptSelector.value;
                scripts[currentScript] = window.monacoEditor.getValue();
                localStorage.setItem('scripts', JSON.stringify(scripts));
            });
        });
    });
};

