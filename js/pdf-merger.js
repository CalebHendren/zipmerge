/*
 * Bubble Sheet + Written Sheet Merger.
 *
 * For every page of the bubble sheet PDF we append a full copy of the
 * written sheet. If the written sheet has an even number of pages, we
 * insert a blank page between students so the next bubble sheet always
 * lands on the front of a fresh sheet of paper when printed double-sided.
 *
 * Optimization vs. the original single-file version:
 *   The old code called `copyPages` inside the loop, once per bubble page,
 *   re-copying the entire written PDF each iteration. The new code copies
 *   every needed page in a single batch up front, which is noticeably
 *   faster on large classes.
 */
window.PdfMerger = (function () {
    async function loadPdf(file) {
        const buffer = await file.arrayBuffer();
        return PDFLib.PDFDocument.load(buffer);
    }

    async function merge(bubbleFile, writtenFile, config, onProgress) {
        const report = onProgress || function () {};
        report(5);

        const [bubblePdf, writtenPdf] = await Promise.all([
            loadPdf(bubbleFile),
            loadPdf(writtenFile),
        ]);
        report(25);

        const mergedPdf = await PDFLib.PDFDocument.create();
        const bubbleIndices = bubblePdf.getPageIndices();
        const writtenIndices = writtenPdf.getPageIndices();
        const bubbleCount = bubbleIndices.length;
        const writtenCount = writtenIndices.length;

        if (bubbleCount === 0) {
            throw new Error("The bubble sheet PDF has no pages.");
        }

        const bubblePages = await mergedPdf.copyPages(bubblePdf, bubbleIndices);
        report(40);

        // Pre-compute every written-page copy in one batch instead of
        // re-copying the written PDF on each loop iteration.
        let writtenCopies = [];
        let blankDims = null;
        if (writtenCount > 0) {
            const flatIndices = [];
            for (let i = 0; i < bubbleCount; i++) {
                for (let j = 0; j < writtenCount; j++) {
                    flatIndices.push(writtenIndices[j]);
                }
            }
            writtenCopies = await mergedPdf.copyPages(writtenPdf, flatIndices);
            blankDims = [writtenCopies[0].getWidth(), writtenCopies[0].getHeight()];
        }
        report(60);

        const addBlank =
            config.addBlankPageBetweenStudents &&
            writtenCount > 0 &&
            writtenCount % 2 === 0;

        for (let i = 0; i < bubbleCount; i++) {
            mergedPdf.addPage(bubblePages[i]);
            for (let j = 0; j < writtenCount; j++) {
                mergedPdf.addPage(writtenCopies[i * writtenCount + j]);
            }
            if (addBlank && i < bubbleCount - 1 && blankDims) {
                mergedPdf.addPage(blankDims);
            }
            report(60 + ((i + 1) / bubbleCount) * 35);
        }

        const bytes = await mergedPdf.save();
        report(100);
        return bytes;
    }

    return { merge: merge };
})();
