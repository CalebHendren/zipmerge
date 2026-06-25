/*
 * Wires the page together: reads the config, builds extension/MIME lists,
 * binds inputs to handlers, and runs the ID processor or PDF merger when
 * the buttons are clicked.
 */
(function () {
    const cfg = window.ZipMergeConfig;
    const utils = window.FileUtils;

    function applyConfig() {
        document.title = cfg.ui.siteTitle || "ZipMerge";

        const title = document.getElementById("siteTitle");
        if (title) title.textContent = cfg.ui.siteTitle || "ZipMerge";

        const idTitle = document.getElementById("idProcessorTitle");
        if (idTitle) idTitle.textContent = cfg.ui.idProcessorTitle;

        const idSub = document.getElementById("idProcessorSubtitle");
        if (idSub) idSub.textContent = cfg.ui.idProcessorSubtitle;

        const mergerTitle = document.getElementById("mergerTitle");
        if (mergerTitle) mergerTitle.textContent = cfg.ui.mergerTitle;

        const themeBtn = document.getElementById("themeToggle");
        if (themeBtn) {
            themeBtn.style.display = cfg.ui.showThemeToggle ? "" : "none";
            themeBtn.addEventListener("click", function () {
                window.Theme.toggle();
            });
        }

        // Build the accept attribute for the ID file picker, optionally
        // excluding Excel formats when the feature is turned off.
        const idAccept = (cfg.studentId.acceptedExtensions || []).filter(function (ext) {
            if (ext === ".xlsx" || ext === ".xls") return cfg.features.enableExcel;
            return true;
        });
        const idInput = document.getElementById("studentIdFile");
        if (idInput) idInput.accept = idAccept.join(",");

        const bubbleInput = document.getElementById("bubbleSheet");
        if (bubbleInput) {
            bubbleInput.accept = cfg.pdfMerger.bubbleSheetExtensions.join(",");
        }
        const writtenInput = document.getElementById("writtenSheet");
        if (writtenInput) {
            writtenInput.accept = cfg.pdfMerger.writtenSheetExtensions.join(",");
        }

        // Project links
        const links = {
            sourceCode: cfg.ui.urls.sourceCode,
            tutorial: cfg.ui.urls.tutorial,
            examples: cfg.ui.urls.examples,
        };
        Object.keys(links).forEach(function (key) {
            const el = document.getElementById("link-" + key);
            if (el && links[key]) el.href = links[key];
        });
    }

    function initIdProcessor() {
        const input = document.getElementById("studentIdFile");
        const info = document.getElementById("studentIdFileInfo");
        const button = document.getElementById("processIdsBtn");
        const status = document.getElementById("idStatus");
        if (!input || !button) return;

        const accepted = (cfg.studentId.acceptedExtensions || []).filter(function (ext) {
            if (ext === ".xlsx" || ext === ".xls") return cfg.features.enableExcel;
            return true;
        });

        let currentFile = null;
        utils.bindFileInput(
            input,
            info,
            function (file) {
                currentFile = file;
                button.disabled = !file;
            },
            accepted,
            cfg.ui.maxFileSizeMB
        );

        button.addEventListener("click", async function () {
            if (!currentFile) return;
            button.disabled = true;
            utils.setStatus(status, "Processing IDs...", "info");
            try {
                const result = await window.IdProcessor.processFile(
                    currentFile,
                    cfg.studentId
                );
                const base = utils.stripExtension(currentFile.name);
                const outName = base + cfg.studentId.outputSuffix + result.extension;
                download(result.blob, outName, result.blob.type);
                utils.setStatus(
                    status,
                    "Success! Processed IDs saved as " + outName,
                    "success"
                );
            } catch (err) {
                console.error("ID processing failed", err);
                utils.setStatus(status, "Error: " + err.message, "error");
            } finally {
                button.disabled = !currentFile;
            }
        });
    }

    function initMerger() {
        const bubbleInput = document.getElementById("bubbleSheet");
        const bubbleInfo = document.getElementById("bubbleSheetInfo");
        const writtenInput = document.getElementById("writtenSheet");
        const writtenInfo = document.getElementById("writtenSheetInfo");
        const button = document.getElementById("processBtn");
        const status = document.getElementById("status");
        const progressBar = document.getElementById("progressBar");
        const progressPct = document.getElementById("progressPercent");
        if (!bubbleInput || !writtenInput || !button) return;

        let bubbleFile = null;
        let writtenFile = null;

        function refresh() {
            button.disabled = !(bubbleFile && writtenFile);
        }

        utils.bindFileInput(
            bubbleInput,
            bubbleInfo,
            function (f) {
                bubbleFile = f;
                refresh();
            },
            cfg.pdfMerger.bubbleSheetExtensions,
            cfg.ui.maxFileSizeMB
        );
        utils.bindFileInput(
            writtenInput,
            writtenInfo,
            function (f) {
                writtenFile = f;
                refresh();
            },
            cfg.pdfMerger.writtenSheetExtensions,
            cfg.ui.maxFileSizeMB
        );

        function setProgress(pct) {
            const v = Math.max(0, Math.min(100, pct));
            progressBar.style.width = v + "%";
            progressPct.textContent = Math.round(v) + "%";
        }

        button.addEventListener("click", async function () {
            if (!bubbleFile || !writtenFile) return;
            button.disabled = true;
            utils.setStatus(status, "Processing...", "info");
            setProgress(0);
            try {
                const bytes = await window.PdfMerger.merge(
                    bubbleFile,
                    writtenFile,
                    cfg.pdfMerger,
                    setProgress
                );
                const outName =
                    utils.stripExtension(bubbleFile.name) +
                    cfg.pdfMerger.outputSuffix +
                    ".pdf";
                download(bytes, outName, "application/pdf");
                utils.setStatus(status, "Success! Saved as " + outName, "success");
            } catch (err) {
                console.error("Merge failed", err);
                utils.setStatus(status, "Error: " + err.message, "error");
                setProgress(0);
            } finally {
                refresh();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        window.Theme.init(cfg.ui.defaultTheme);
        applyConfig();
        initIdProcessor();
        initMerger();
    });
})();
