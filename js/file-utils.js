/*
 * Shared file helpers used by both the ID processor and the merger.
 */
window.FileUtils = (function () {
    function getExtension(filename) {
        const dot = filename.lastIndexOf(".");
        return dot === -1 ? "" : filename.substring(dot).toLowerCase();
    }

    function stripExtension(filename) {
        const dot = filename.lastIndexOf(".");
        return dot === -1 ? filename : filename.substring(0, dot);
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }

    function validateUpload(file, accepted, maxMB) {
        const ext = getExtension(file.name);
        if (accepted.length && !accepted.includes(ext)) {
            throw new Error(
                "Unsupported file type \"" + ext + "\". Accepted: " +
                    accepted.join(", ")
            );
        }
        if (maxMB > 0 && file.size > maxMB * 1024 * 1024) {
            throw new Error(
                "File is too large (" + formatSize(file.size) +
                    "). Maximum allowed is " + maxMB + " MB."
            );
        }
    }

    function bindFileInput(input, infoEl, onValid, accepted, maxMB) {
        function update() {
            const file = input.files[0];
            if (!file) {
                infoEl.textContent = "No file selected";
                onValid(null);
                return;
            }
            try {
                validateUpload(file, accepted, maxMB);
                infoEl.textContent = file.name + " (" + formatSize(file.size) + ")";
                infoEl.style.color = "";
                onValid(file);
            } catch (err) {
                infoEl.textContent = err.message;
                infoEl.style.color = "var(--red)";
                input.value = "";
                onValid(null);
            }
        }

        input.addEventListener("change", update);

        // Drag-and-drop support: dropping a file on the file input itself
        // already works in modern browsers, but we add visual feedback on
        // the surrounding wrapper.
        const wrapper = input.closest(".drop-zone");
        if (wrapper) {
            ["dragenter", "dragover"].forEach(function (evt) {
                wrapper.addEventListener(evt, function (e) {
                    e.preventDefault();
                    wrapper.classList.add("drag-over");
                });
            });
            ["dragleave", "drop"].forEach(function (evt) {
                wrapper.addEventListener(evt, function (e) {
                    e.preventDefault();
                    wrapper.classList.remove("drag-over");
                });
            });
        }

        update();
    }

    function setStatus(element, message, type) {
        element.textContent = message || "";
        element.className = message ? "status " + (type || "info") : "status";
    }

    return {
        getExtension: getExtension,
        stripExtension: stripExtension,
        formatSize: formatSize,
        validateUpload: validateUpload,
        bindFileInput: bindFileInput,
        setStatus: setStatus,
    };
})();
