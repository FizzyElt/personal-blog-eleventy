type Theme = "light" | "dark";
const storageKey = "blog-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const root = document.documentElement;

function readPreference(): Theme | undefined {
    try {
        const value = localStorage.getItem(storageKey);
        return value === "light" || value === "dark" ? value : undefined;
    } catch {
        return undefined;
    }
}

let preference = readPreference();
let button: HTMLButtonElement | null = null;

function applyTheme(): void {
    const theme = preference ?? (systemTheme.matches ? "dark" : "light");
    root.dataset.theme = theme;
    if (button) {
        const label = theme === "dark" ? "切換至明亮模式" : "切換至深色模式";
        button.setAttribute("aria-label", label);
        button.title = label;
    }
    window.dispatchEvent(new Event("themechange"));
}

// Runs in the head before styles and page content to avoid a theme flash.
applyTheme();
systemTheme.addEventListener("change", () => {
    if (!preference) applyTheme();
});
window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
        preference = readPreference();
        applyTheme();
    }
});
document.addEventListener("DOMContentLoaded", () => {
    button = document.querySelector<HTMLButtonElement>(".theme-toggle");
    if (!button) return;
    button.hidden = false;
    button.addEventListener("click", () => {
        preference = root.dataset.theme === "dark" ? "light" : "dark";
        try {
            localStorage.setItem(storageKey, preference);
        } catch {
            // Switching still works when browser storage is unavailable.
        }
        applyTheme();
    });
    applyTheme();
});
