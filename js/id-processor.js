/*
 * Student ID Processor.
 *
 * Strips the configured prefix (default "#A00") from the start of student
 * IDs in a CSV or Excel file.
 *
 * Bug fix vs. the original single-file version:
 *   The old function did `currentId.replace(/\D/g, "")` after substring(),
 *   which silently dropped quote characters from quoted CSV cells -- so a
 *   value like `"#A000123456"` (quoted in the CSV) would skip the prefix
 *   branch entirely and emit `000123456`, making it look like an extra
 *   leading zero was being kept (or, depending on interpretation, that a
 *   real leading zero had been stripped). The new implementation only
 *   removes the literal prefix, and only when it matches exactly, so any
 *   leading zero that's part of the actual ID is always preserved.
 */
window.IdProcessor = (function () {
    function formatId(rawId, prefix) {
        const trimmed = String(rawId == null ? "" : rawId).trim();
        if (prefix && trimmed.startsWith(prefix)) {
            return trimmed.substring(prefix.length);
        }
        return trimmed;
    }

    function parseCsvLine(line) {
        const out = [];
        let cell = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === "," && !inQuotes) {
                out.push(cell);
                cell = "";
            } else {
                cell += ch;
            }
        }
        out.push(cell);
        return out;
    }

    function formatCsvCell(value) {
        const s = String(value == null ? "" : value);
        if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    }

    function shouldFormat(cell, prefix, isHeader, preserveHeader) {
        if (cell == null || cell === "") return false;
        if (isHeader && preserveHeader) {
            // Only treat the first row as data if it actually looks like an
            // ID (starts with the prefix). Otherwise leave the header alone.
            return String(cell).trim().startsWith(prefix);
        }
        return true;
    }

    function processCsvText(text, config) {
        const lines = text.split(/\r\n|\r|\n/);
        const out = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Drop a single trailing empty line (common with text editors)
            if (line === "" && i === lines.length - 1) continue;

            if (line.trim() === "") {
                out.push("");
                continue;
            }

            const cells = parseCsvLine(line);
            const target = cells[config.idColumnIndex];
            const isHeader = i === 0;

            if (shouldFormat(target, config.prefix, isHeader, config.preserveHeader)) {
                cells[config.idColumnIndex] = formatId(target, config.prefix);
            }

            out.push(cells.map(formatCsvCell).join(","));
        }

        return out.join("\n");
    }

    async function processCsvFile(file, config) {
        const text = await file.text();
        const processed = processCsvText(text, config);
        return {
            blob: new Blob([processed], { type: "text/csv;charset=utf-8;" }),
            extension: ".csv",
        };
    }

    async function processExcelFile(file, config) {
        if (typeof XLSX === "undefined") {
            throw new Error(
                "Excel support is not loaded. Refresh the page or disable " +
                    "features.enableExcel in js/config.js."
            );
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new Error("The workbook contains no sheets.");
        }
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            raw: false,
        });

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const isHeader = i === 0;
            const target = row[config.idColumnIndex];
            if (shouldFormat(target, config.prefix, isHeader, config.preserveHeader)) {
                row[config.idColumnIndex] = formatId(target, config.prefix);
            }
        }

        const newSheet = XLSX.utils.aoa_to_sheet(rows);
        const newBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newBook, newSheet, sheetName);
        const bytes = XLSX.write(newBook, { type: "array", bookType: "xlsx" });
        return {
            blob: new Blob([bytes], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            extension: ".xlsx",
        };
    }

    async function processFile(file, config) {
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (ext === ".csv") return processCsvFile(file, config);
        if (ext === ".xlsx" || ext === ".xls") {
            return processExcelFile(file, config);
        }
        throw new Error("Unsupported file type: " + ext);
    }

    return {
        formatId: formatId,
        parseCsvLine: parseCsvLine,
        formatCsvCell: formatCsvCell,
        processCsvText: processCsvText,
        processCsvFile: processCsvFile,
        processExcelFile: processExcelFile,
        processFile: processFile,
    };
})();
