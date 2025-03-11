function printSavedScripts() {
    const scripts = JSON.parse(localStorage.getItem('scripts')) || {};
    console.log(JSON.stringify(scripts, null, 4));
}

