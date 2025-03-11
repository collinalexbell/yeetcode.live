window.onload = function () {
    require(['vs/editor/editor.main'], function () {
        const scriptSelector = document.getElementById('script-selector');
        const newScriptBtn = document.getElementById('new-script-btn');
        const deleteScriptBtn = document.getElementById('delete-script-btn');

        async function loadDefaultScripts() {
            try {
                const response = await fetch('default-scripts.json');
                if (!response.ok) throw new Error("Failed to fetch default scripts");

                const defaultScripts = await response.json();
                let savedScripts = JSON.parse(localStorage.getItem('scripts')) || {};

                Object.keys(defaultScripts).forEach(scriptName => {
                    if (!(scriptName in savedScripts)) {
                        savedScripts[scriptName] = defaultScripts[scriptName];
                    }
                });

                localStorage.setItem('scripts', JSON.stringify(savedScripts));
                return savedScripts;
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

            // **Delete Script Feature**
            deleteScriptBtn.addEventListener('click', function () {
                const scriptToDelete = scriptSelector.value;
                if (scriptToDelete === "default") {
                    alert("You cannot delete the default script!");
                    return;
                }

                if (!confirm(`Are you sure you want to delete "${scriptToDelete}"?`)) return;

                // Remove the script
                delete scripts[scriptToDelete];
                localStorage.setItem('scripts', JSON.stringify(scripts));

                // Update dropdown
                updateScriptSelector();

                // Select first available script
                scriptSelector.value = Object.keys(scripts)[0];
                window.monacoEditor.setValue(scripts[scriptSelector.value]);
            });
        });
    });
	document.addEventListener('keydown', (event) => {
    if (event.key === '.') {
        // Explicitly focus Monaco editor and allow clicking inside
        controls.unlock();
        window.monacoEditor.focus();
    }
});

};

