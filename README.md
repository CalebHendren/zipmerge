# ZipMerge

**Website:** [https://calebhendren.github.io/zipmerge/](https://calebhendren.github.io/zipmerge/)

## About

This program simply adds a new page to the backs of multiple choice scanforms for written and essay questions. This way, when printed front and back, the scanform will be on the front and the written section will be on the back. It is primarily made with ZipGrade in mind. Other services, such as Akindi, are untested, but it should work.

**Example Input and Output files:**  
[https://github.com/CalebHendren/zipmerge/tree/master/Example](https://github.com/CalebHendren/zipmerge/tree/master/Example)

## Usage

> **Note:** Step 1 is optional if you don't want student names and other information pre-printed on the sheets, but at that point, you may as well just merge the two single-page PDF files manually in Adobe Acrobat. But you can still use this if you don't like dealing with Acrobat (my hatred of Acrobat is what prompted me to make this).

### Step 1: Create a class on ZipGrade and import a classlist from your LMS ("eLearn")
See: [https://support.zipgrade.com/hc/en-us/articles/202512649-How-do-I-enter-edit-import-students](https://support.zipgrade.com/hc/en-us/articles/202512649-How-do-I-enter-edit-import-students)

### Step 2: Create a custom answer sheet on ZipGrade
See: [https://support.zipgrade.com/hc/en-us/articles/115001172783-How-do-I-create-custom-answer-sheets](https://support.zipgrade.com/hc/en-us/articles/115001172783-How-do-I-create-custom-answer-sheets)

### Step 3: Download the custom Answer Sheet Packets
(ZipGrade → Classes → Answer Sheet Packets). Student names, the quiz/exam name, and all other information will already be filled out if you completed Step 1.

### Step 4: Prepare your files
Take your Answer Sheet Packets from ZipGrade and the Written Sheet PDF that you created. Go to:  
[https://calebhendren.github.io/zipmerge/](https://calebhendren.github.io/zipmerge/)

### Step 5: Merge your files
1. Select the Answer Sheet Packets as the **Bubble Sheet**
2. Select the Written Sheet as the **Written Answer Sheet**
3. Click **Merge**

## Upcoming Features

### Accept Microsoft Word documents for the Written Answer Sheet to avoid the conversion to PDF. 
The issue is that after being uploaded, they will have to be converted into HTML then into a PDF because I cannot find a way to directly convert into a PDF in a way that can be done 100% in the browser.

### Process student IDs to make them ZipGrade compatable
ZipGrade only accepts numbers in the student ID field. When exported from Brightspace, they are in the format #A00123456. ZipGrade can automatically assign random numbers as IDs, but if you would rather use their actual IDs, I plan to add a way to automatically cut off the unnecessary "#A00" and keep the "123456." In the mean time, this can be done quickly in Excel using the formula =RIGHT(A2, LEN(A2) - 4) and dragging the fill handle down.
