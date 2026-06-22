/*
 * Theme toggling (dark <-> light) with localStorage persistence.
 */
window.Theme = (function () {
    const STORAGE_KEY = "theme";

    function apply(theme) {
        document.body.classList.toggle("light-mode", theme === "light");
    }

    function init(defaultTheme) {
        const saved = localStorage.getItem(STORAGE_KEY);
        apply(saved || defaultTheme || "dark");
    }

    function toggle() {
        const isLight = document.body.classList.toggle("light-mode");
        localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
    }

    return { init: init, toggle: toggle };
})();
