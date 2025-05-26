# Procare Photo Downloader Automation Script

## Description

This script provides an automated way to bulk download photos from the Procare web application (`schools.procareconnect.com` or similar). It is designed for parents who want to save photos of their children shared by the school, as Procare currently does not offer a direct bulk download feature for parents.

The script automates:
1.  Selecting a specified month or range of months in the Procare photo gallery.
2.  Scrolling the page to ensure all photos for the selected period(s) are loaded.
3.  Initiating downloads for each photo, with customizable album-based naming.

## Features

* **Bulk Photo Download**: Initiates downloads for all loaded photos.
* **Month Range Selection**: Specify a start and end month/year to download photos across multiple periods.
* **Automated Calendar Navigation**: Attempts to programmatically select the target month(s) in the Procare calendar.
* **Automated Scrolling**: Simulates scrolling to trigger the loading of all incrementally-loaded photos.
* **Customizable Album Naming**: Creates filenames prefixed with a base album name and the year/month of the photo.
* **Reduced Interaction**: Minimizes confirmation popups for a smoother automated process after initial setup.
* **Duplicate Prevention**: Avoids re-downloading the same photo URL if encountered multiple times on the page for a given month.

## Why This Script?

Many childcare centers use Procare to share photos with parents. However, downloading these photos one by one can be very time-consuming. This script aims to solve that problem by automating the process, allowing parents to easily back up their cherished memories.

## Prerequisites

1.  **A modern web browser**: Google Chrome, Microsoft Edge, or other Chromium-based browsers are recommended, as the script is typically tested in these environments.
2.  **Access to Developer Console**: You'll need to be able to open the browser's developer console to run the script.
3.  **Procare Account**: Active login credentials for your Procare parent portal.
4.  **Patience**: For large date ranges or many photos, the script will take time to initiate all downloads.

## How to Use

### 1. Preparation

1.  **Navigate to Procare**: Log in to your Procare account and go to the main "Photos/Videos" or gallery section where you can see your child's photos.
2.  **Open Developer Console**:
    * On Windows/Linux: Press `F12` or `Ctrl+Shift+I`.
    * On Mac: Press `Cmd+Option+I`.
    * Alternatively, right-click anywhere on the page, select "Inspect" or "Inspect Element," and then navigate to the "Console" tab.
3.  **Get the Script**:
    * Open the `procare_downloader_script.js` file from this GitHub repository.
    * Click on the "Raw" button (or view the raw file content).
    * Select all the code (`Ctrl+A` or `Cmd+A`) and copy it (`Ctrl+C` or `Cmd+C`).

### 2. Running the Script

1.  **Paste the Script**: In the browser's developer console you opened in Procare, paste the entire copied script code and press `Enter`. This defines the necessary functions.
    * *Note*: Some browsers might show a warning about pasting code into the console. Understand the risk (this script is designed to interact with the page and trigger downloads).
2.  **Execute the Main Function**: After pasting and pressing Enter (to ensure the functions are defined in the console's memory), type the following command into the console and press `Enter` again:
    ```javascript
    automateRangeAndDownloadProcarePhotos();
    ```

### 3. Prompts

The script will then prompt you for the following information:

1.  **Base Album Name**: Enter a general name for your photo albums (e.g., "ChildsName_School_Photos"). The script will automatically append the year and month to this base name for each month's downloads (e.g., `ChildsName_School_Photos_2025_05`).
2.  **Start Year**: The year you want to begin downloading from (e.g., `2024`).
3.  **Start Month**: The month (1-12) you want to begin downloading from (e.g., `1` for January).
4.  **End Year**: The year you want to end downloading at.
5.  **End Month**: The month (1-12) you want to end downloading at.

After providing these details, the script will show a brief confirmation alert and then proceed with the automation. Monitor the console for progress updates and any error messages.

## Configuration (Important!)

At the top of the `procare_downloader_script.js` file, you'll find a `CONFIG` object:

```javascript
const CONFIG = {
    calendarOpenerSelector: "div.month-picker__trigger",
    yearDisplaySelector: "div.month-picker__year-value",
    prevYearButtonSelector: "div.month-picker__year-arrow-left",
    nextYearButtonSelector: "div.month-picker__year-arrow-right",
    monthCellSelector: "div.month-picker__cell",

    photoGalleryItemSelector: ".gallery__item-download",
    scrollContainerSelector: "section.section", // Primary scroll area

    waitForElementTimeout: 7000,
    shortDelay: 1500,
    scrollLoadDelay: 3500,
    maxScrollAttempts: 40,
    postMonthSelectionDelay: 15000,
    delayBetweenMonths: 5000,
    downloadInterval: 1700
};
