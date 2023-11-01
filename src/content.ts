export function initialize() {
    const settingsButton = document.getElementById("openSettings");
    if (settingsButton) settingsButton.addEventListener("click", () => toggleSettings(), false);
}

function toggleSettings() {
    const settings = document.getElementById("settings");
    if (settings && settings.classList.contains("hidden")) settings.classList.remove("hidden");
    else if (settings) settings.classList.add("hidden");
}