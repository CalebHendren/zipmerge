/*
 * ZipMerge configuration.
 *
 * Edit this file to customize ZipMerge for your school or course without
 * touching the rest of the code. After saving, refresh the page to apply.
 */
window.ZipMergeConfig = {
    /* ---------------------------------------------------------------- */
    /* Student ID Processor                                             */
    /* ---------------------------------------------------------------- */
    studentId: {
        // The exact prefix to strip from the start of each student ID.
        // Only this literal string is removed -- any zeros or digits that
        // follow the prefix are always preserved as part of the real ID.
        // Examples (with prefix "#A00"):
        //   "#A00123456"  -> "123456"
        //   "#A000123456" -> "0123456"   (the third 0 is part of the ID)
        prefix: "#A00",

        // Zero-based column index in the spreadsheet/CSV that holds IDs.
        idColumnIndex: 0,

        // If true, the first row is treated as a header. Header cells that
        // don't start with the prefix are left untouched (so "Student ID"
        // stays "Student ID"). Set to false to process every row.
        preserveHeader: true,

        // Suffix appended to the uploaded filename for the download.
        // e.g. "roster.csv" -> "roster_processed_IDs.csv"
        outputSuffix: "_processed_IDs",

        // File extensions accepted by the file picker. Excel formats are
        // only honored when features.enableExcel is true.
        acceptedExtensions: [".csv", ".xlsx", ".xls"],
    },

    /* ---------------------------------------------------------------- */
    /* Bubble Sheet + Written Sheet Merger                              */
    /* ---------------------------------------------------------------- */
    pdfMerger: {
        // When the written sheet has an even number of pages, insert a
        // blank page between students so each new bubble sheet starts on
        // the front side of a fresh sheet of paper.
        addBlankPageBetweenStudents: true,

        // Suffix appended to the uploaded filename for the download.
        // e.g. "BubbleSheets.pdf" -> "BubbleSheets_merged.pdf"
        outputSuffix: "_merged",

        // File extensions accepted for the bubble (answer) sheet input.
        bubbleSheetExtensions: [".pdf"],

        // File extensions accepted for the written sheet input.
        writtenSheetExtensions: [".pdf"],
    },

    /* ---------------------------------------------------------------- */
    /* User interface                                                   */
    /* ---------------------------------------------------------------- */
    ui: {
        // Default theme on first visit: "dark" or "light". After that, the
        // user's choice is remembered in localStorage.
        defaultTheme: "dark",

        // Show the theme toggle button in the top-right corner.
        showThemeToggle: true,

        // Maximum upload size in megabytes. Set to 0 to disable the check.
        maxFileSizeMB: 100,

        // Headings shown on each tool.
        idProcessorTitle: "Student ID Processor for ZipGrade",
        idProcessorSubtitle:
            "Converts LMS IDs (e.g. #A00123456) to ZipGrade-compatible IDs " +
            "(e.g. 123456) by removing the configured prefix. Processes the " +
            "first column of a CSV or Excel file.",
        mergerTitle: "Bubble Sheet + Written Sheet Merger",

        // Links shown under the merger heading.
        urls: {
            sourceCode: "https://github.com/CalebHendren/zipmerge",
            tutorial:
                "https://github.com/CalebHendren/zipmerge/blob/master/README.md",
            examples:
                "https://github.com/CalebHendren/zipmerge/tree/master/Example",
        },
    },

    /* ---------------------------------------------------------------- */
    /* Feature flags                                                    */
    /* ---------------------------------------------------------------- */
    features: {
        // Accept .xlsx / .xls uploads in the Student ID Processor. Requires
        // the SheetJS script tag in index.html to remain loaded.
        enableExcel: true,
    },
};
