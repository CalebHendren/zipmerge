# ZipMerge

**Website:** [https://calebhendren.github.io/zipmerge/](https://calebhendren.github.io/zipmerge/)

## About

ZipMerge is a small browser-only toolkit for ZipGrade-style multiple choice exams. It does two things:

1. **Student ID Processor** — strips the `#A00` prefix that LMS exports add to student IDs, so the resulting roster can be imported straight into ZipGrade. Accepts CSV and Excel files.
2. **Bubble Sheet + Written Sheet Merger** — interleaves a bubble-sheet PDF with a written-answer PDF so that, when printed double-sided, the written section ends up on the back of every bubble sheet.

Everything runs in your browser. Nothing is uploaded to a server.

**Example input and output files:**
[https://github.com/CalebHendren/zipmerge/tree/master/Example](https://github.com/CalebHendren/zipmerge/tree/master/Example)

## Student ID Processor for ZipGrade

Converts LMS IDs (e.g. `#A00123456`) to ZipGrade-compatible IDs (e.g. `123456`) by removing the configured prefix. Processes the first column of a CSV or Excel file.

### Steps
1. **Export your roster** from your LMS as a CSV or Excel file. Student IDs should be in the first column.
2. Go to [https://calebhendren.github.io/zipmerge/](https://calebhendren.github.io/zipmerge/).
3. In the **Student ID Processor** card at the top of the page, click *Choose File* and pick your roster.
4. Click **Process IDs**.
5. The processed file (e.g. `roster_processed_IDs.csv` or `roster_processed_IDs.xlsx`) is downloaded automatically. Import it into ZipGrade ([how-to](https://support.zipgrade.com/hc/en-us/articles/202512649-How-do-I-enter-edit-import-students)).

### What the prefix rule does
Only the literal prefix is removed, and only when it appears at the start of the cell. Any zeros or digits that follow the prefix are part of the real ID and are always preserved:

| Input          | Output     |
|----------------|------------|
| `#A00123456`   | `123456`   |
| `#A000123456`  | `0123456`  |
| `#A00012345`   | `012345`   |
| `Student ID`   | `Student ID` (header rows are left alone) |

The previous version sometimes ate the leading zero of the real ID when the CSV cell was quoted; that's fixed.

## Bubble Sheet + Written Sheet Merger

> **Note:** Step 1 is optional if you don't want student names and other information pre-printed on the sheets, but at that point you may as well merge the two single-page PDFs manually in Adobe Acrobat. (Hating Acrobat is what prompted this project.)

### Step 1: Create a class on ZipGrade and import a classlist from your LMS
See: [https://support.zipgrade.com/hc/en-us/articles/202512649-How-do-I-enter-edit-import-students](https://support.zipgrade.com/hc/en-us/articles/202512649-How-do-I-enter-edit-import-students)

### Step 2: Create a custom answer sheet on ZipGrade
See: [https://support.zipgrade.com/hc/en-us/articles/115001172783-How-do-I-create-custom-answer-sheets](https://support.zipgrade.com/hc/en-us/articles/115001172783-How-do-I-create-custom-answer-sheets)

### Step 3: Download the custom Answer Sheet Packets
*ZipGrade → Classes → Answer Sheet Packets.* Student names, the quiz/exam name, and other information are already filled in if you did Step 1.

### Step 4: Prepare your files
Take your Answer Sheet Packets from ZipGrade and the Written Sheet PDF that you created. Go to [https://calebhendren.github.io/zipmerge/](https://calebhendren.github.io/zipmerge/).

### Step 5: Merge your files
1. Select the Answer Sheet Packets as the **Bubble Sheet**.
2. Select the Written Sheet as the **Written Answer Sheet**.
3. Click **Merge**.

The merged PDF is downloaded automatically.

## Configuration

Settings a professor is likely to want to change all live in [`js/config.js`](js/config.js). Edit the file, save, and refresh the page. No build step.

| Setting                                          | Default                  | What it does |
|--------------------------------------------------|--------------------------|--------------|
| `studentId.prefix`                               | `"#A00"`                 | The exact string stripped from the start of every student ID. |
| `studentId.idColumnIndex`                        | `0`                      | Which column (0-based) holds the IDs. |
| `studentId.preserveHeader`                       | `true`                   | If `true`, the first row is treated as a header and only processed when it actually starts with the prefix. |
| `studentId.outputSuffix`                         | `"_processed_IDs"`       | Suffix added to the downloaded file's name. |
| `studentId.acceptedExtensions`                   | `[".csv", ".xlsx", ".xls"]` | File types the upload box accepts. |
| `pdfMerger.addBlankPageBetweenStudents`          | `true`                   | When the written sheet has an even number of pages, insert a blank between students so each bubble sheet lands on the front of a fresh sheet of paper. |
| `pdfMerger.outputSuffix`                         | `"_merged"`              | Suffix added to the merged PDF's name. |
| `pdfMerger.bubbleSheetExtensions`                | `[".pdf"]`               | File types accepted for the bubble sheet input. |
| `pdfMerger.writtenSheetExtensions`               | `[".pdf"]`               | File types accepted for the written sheet input. |
| `ui.defaultTheme`                                | `"dark"`                 | `"dark"` or `"light"`. The user's choice is remembered after that. |
| `ui.showThemeToggle`                             | `true`                   | Show the toggle in the top-right corner. |
| `ui.maxFileSizeMB`                               | `100`                    | Reject uploads larger than this. `0` disables the check. |
| `ui.idProcessorTitle` / `ui.idProcessorSubtitle` / `ui.mergerTitle` | (see file) | Headings shown on each card. |
| `ui.urls.sourceCode` / `tutorial` / `examples`   | (see file)               | Links shown under the merger heading. |
| `features.enableExcel`                           | `true`                   | Accept `.xlsx` / `.xls` uploads in the ID processor. Turn this off if you don't need it; you can also remove the SheetJS `<script>` tag from `index.html`. |

## Project layout

```
zipmerge/
├── index.html              Markup only -- no inline CSS or JS
├── css/
│   └── styles.css          All styling, including the light/dark themes
├── js/
│   ├── config.js           Settings (the only file most people need to edit)
│   ├── file-utils.js       Shared upload validation + drag-and-drop wiring
│   ├── theme.js            Dark/light toggle (persists in localStorage)
│   ├── id-processor.js     CSV/Excel ID stripping
│   ├── pdf-merger.js       Bubble + written PDF interleaving
│   └── main.js             Glue: reads config and wires up the page
├── Example/                Sample input + output files
└── .github/workflows/      GitHub Pages deployment
```

## What's new in this refactor

- **Multi-file structure** so the HTML, styles, and individual tools each live in their own file.
- **`js/config.js`** gathers everything a professor might want to tweak (prefix, column, theme, etc.) in one place.
- **Excel support** for the Student ID Processor via [SheetJS](https://sheetjs.com/) — you can upload and download `.xlsx` and `.xls` directly.
- **ID Processor moved to the top of the page**, merger below it.
- **CSV bug fix**: only the configured prefix is stripped, and quoted cells are parsed properly, so leading zeros that are part of the real student ID are no longer dropped.
- **Quoted/escaped CSV parsing**: cells containing commas, quotes, or newlines round-trip correctly.
- **Merger optimization**: the written PDF's pages are copied in a single batch instead of being re-copied once per bubble page.
- **Drag-and-drop**, larger error messages, and an upload size cap (`ui.maxFileSizeMB`).

## Notes on .docx for the merger

Reliably converting Word documents to PDF in the browser without sending the file to a server isn't really possible today — `mammoth.js` + `html2pdf.js` doesn't preserve page breaks or page count well enough for a printing workflow, where getting the page count wrong means wasted paper. For now, convert your `.docx` to PDF in Word, Google Docs, or LibreOffice before merging. The merger code is easy to extend if a viable client-side converter shows up later.
