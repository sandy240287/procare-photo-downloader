// --- START OF FULL AUTOMATION SCRIPT (V2 - Improved Alert Timing) ---

// ====================================================================================
// CONFIGURATION (Adjust if necessary)
// ====================================================================================
const CONFIG = {
    calendarOpenerSelector: "div.month-picker__trigger",
    yearDisplaySelector: "div.month-picker__year-value",
    prevYearButtonSelector: "div.month-picker__year-arrow-left",
    nextYearButtonSelector: "div.month-picker__year-arrow-right",
    monthCellSelector: "div.month-picker__cell",

    photoGalleryItemSelector: ".gallery__item-download",
    scrollContainerSelector: "section.section",

    waitForElementTimeout: 7000,
    shortDelay: 1500,
    scrollLoadDelay: 3500,
    maxScrollAttempts: 40,
    postMonthSelectionDelay: 15000,
    delayBetweenMonths: 5000,
    downloadInterval: 1700 // Milliseconds between individual download initiations per month
};

// ====================================================================================
// HELPER FUNCTIONS (Unchanged)
// ====================================================================================
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForElement(selector, timeout = CONFIG.waitForElementTimeout, parent = document) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const element = parent.querySelector(selector);
        if (element) {
            const style = window.getComputedStyle(element);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                return element;
            }
        }
        await wait(100);
    }
    console.error(`Element with selector "${selector}" not found or not visible within ${timeout}ms.`);
    return null;
}

async function clickElement_noAlerts(selector, description, parent = document) {
    const element = await waitForElement(selector, CONFIG.waitForElementTimeout, parent);
    if (element) {
        console.log(`Clicking ${description} (selector: ${selector})...`);
        element.click();
        await wait(CONFIG.shortDelay);
        return true;
    }
    console.error(`Could not find or click ${description} with selector: ${selector}`);
    return false;
}

function getMonthNameAbbr(monthNumber) { // 1 = Jan, 12 = Dec
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (monthNumber >= 1 && monthNumber <= 12) ? monthNames[monthNumber - 1] : "";
}

// ====================================================================================
// MONTH SELECTION (Unchanged from previous working version with noAlerts)
// ====================================================================================
async function selectProcareMonth_noAlerts(targetYear, targetMonth) {
    console.log(`Attempting to select month: ${targetMonth}/${targetYear}`);
    const calendarOpener = await waitForElement(CONFIG.calendarOpenerSelector);
    if (!calendarOpener) {
        console.error("Could not find the calendar opener/display. Cannot select date.");
        return false;
    }
     // Check if the calendar is already effectively open by seeing if year navigation is visible
    const yearDisplayForCheck = document.querySelector(CONFIG.yearDisplaySelector);
    if (!yearDisplayForCheck || window.getComputedStyle(yearDisplayForCheck).display === 'none') {
        console.log("Clicking calendar opener/display area to ensure it's active...");
        calendarOpener.click();
        await wait(CONFIG.shortDelay);
    } else {
        console.log("Calendar controls appear to be already visible.");
    }
    
    let currentYearElement = await waitForElement(CONFIG.yearDisplaySelector);
    if (!currentYearElement) {
        console.error("Could not find the current year display element in the calendar.");
        return false;
    }
    let currentYear = parseInt(currentYearElement.textContent.trim());
    let yearNavAttempts = 0;
    const maxYearNavAttempts = 24;

    while (currentYear !== targetYear && yearNavAttempts < maxYearNavAttempts) {
        const yearButtonSelector = currentYear < targetYear ? CONFIG.nextYearButtonSelector : CONFIG.prevYearButtonSelector;
        const yearButtonDescription = currentYear < targetYear ? "Next Year Button" : "Previous Year Button";
        if (!await clickElement_noAlerts(yearButtonSelector, yearButtonDescription)) {
            console.error(`Failed to click ${yearButtonDescription}. Cannot change year.`);
            return false;
        }
        currentYearElement = await waitForElement(CONFIG.yearDisplaySelector);
        if (!currentYearElement) {
            console.error("Year display element disappeared after navigation.");
            return false;
        }
        currentYear = parseInt(currentYearElement.textContent.trim());
        console.log(`Current displayed year: ${currentYear}`);
        yearNavAttempts++;
        await wait(CONFIG.shortDelay / 3);
    }

    if (currentYear !== targetYear) {
        console.error(`Failed to navigate to year ${targetYear}. Current year: ${currentYear}.`);
        return false;
    }
    console.log(`Year ${targetYear} is displayed.`);

    const targetMonthAbbr = getMonthNameAbbr(targetMonth).toLowerCase();
    const monthCells = Array.from(document.querySelectorAll(CONFIG.monthCellSelector));
    const targetMonthElement = monthCells.find(cell => cell.textContent.trim().toLowerCase() === targetMonthAbbr);

    if (targetMonthElement) {
        console.log(`Clicking month: ${targetMonthAbbr.toUpperCase()}`);
        targetMonthElement.click();
        await wait(CONFIG.shortDelay);
        console.log(`Month ${targetMonth}/${targetYear} selected.`);
        return true;
    } else {
        console.error(`Could not find month "${targetMonthAbbr.toUpperCase()}" in the calendar.`);
        return false;
    }
}

// ====================================================================================
// AUTO-SCROLL TO LOAD IMAGES (Unchanged from previous working version)
// ====================================================================================
async function autoScrollToLoadImages() {
    console.log("Starting auto-scroll to load all images...");
    let scrollContainer = document.querySelector(CONFIG.scrollContainerSelector);
    let scroller; 
    if (scrollContainer) {
        console.log(`Using scroll container: ${CONFIG.scrollContainerSelector}`);
        scroller = scrollContainer;
    } else {
        console.log("Specific scroll container not found, defaulting to window scrolling.");
        scrollContainer = window; 
        scroller = document.documentElement; 
    }    
    let previousPhotoCount = -1;
    let currentPhotoCount = 0;
    let stableScrollCount = 0;
    let attempts = 0;

    while (attempts < CONFIG.maxScrollAttempts) {
        currentPhotoCount = document.querySelectorAll(CONFIG.photoGalleryItemSelector).length;
        console.log(`Scrolling down... (Attempt ${attempts + 1}/${CONFIG.maxScrollAttempts}). Photos so far: ${currentPhotoCount}`);
        const initialScrollTop = scroller.scrollTop;
        const initialScrollHeight = (scrollContainer === window) ? document.body.scrollHeight : scroller.scrollHeight;

        if (scrollContainer === window) {
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            scroller.scrollTop = scroller.scrollHeight;
        }
        
        await wait(CONFIG.scrollLoadDelay);
        const newPhotoCount = document.querySelectorAll(CONFIG.photoGalleryItemSelector).length;
        const finalScrollHeight = (scrollContainer === window) ? document.body.scrollHeight : scroller.scrollHeight;

        if (newPhotoCount === currentPhotoCount) {
            if ( (scrollContainer === window && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) ||
                 (scrollContainer !== window && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 10) ||
                 (finalScrollHeight <= initialScrollHeight && currentPhotoCount > 0) 
            ) {
                stableScrollCount++;
            } else if (currentPhotoCount === 0 && attempts > 2) {
                stableScrollCount = 2; 
            }
            else {
                stableScrollCount = 0; 
            }
        } else { 
            stableScrollCount = 0;
        }
        currentPhotoCount = newPhotoCount;
        attempts++;
        if (stableScrollCount >= 2) {
            console.log("No new images loaded after multiple scrolls or reached bottom. Assuming all are loaded.");
            break;
        }
    }
    if (attempts >= CONFIG.maxScrollAttempts) {
         console.warn("Reached max scroll attempts. Proceeding with current images.");
    }
    console.log(`Auto-scrolling finished. Total photo items found for this month: ${currentPhotoCount}`);
    return currentPhotoCount;
}

// ====================================================================================
// PHOTO DOWNLOADER (V4 - MODIFIED to return a Promise)
// ====================================================================================
function procarePhotoDownloaderV4(albumNameForMonth) {
    if (!albumNameForMonth || albumNameForMonth.trim() === "") {
        console.error("Album name is missing for procarePhotoDownloaderV4. Skipping downloads for this batch.");
        return Promise.resolve(0); // Return a resolved promise with 0
    }
    console.log(`Starting downloads for album: ${albumNameForMonth}`);

    const sanitizedAlbumName = albumNameForMonth.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    const finalAlbumName = sanitizedAlbumName || "ProcarePhotos";

    var elements = document.querySelectorAll(CONFIG.photoGalleryItemSelector);
    if (elements.length === 0) {
        console.log("No download elements found for this month.");
        return Promise.resolve(0);
    }
    console.log(`Found ${elements.length} photo elements to process for ${finalAlbumName}.`);

    let downloadedCount = 0; // Local to this function call
    var processedUrls = new Set();
    const downloadPromises = [];

    elements.forEach(function (element, index) {
        const currentFileDelay = index * CONFIG.downloadInterval;
        
        const p = new Promise(resolveFile => {
            setTimeout(function () {
                if (element.dataset.downloadAttemptedV4 === 'true') {
                    console.log(`Skipping already processed DOM element by V4: ${element.getAttribute("href")}`);
                    resolveFile(); // Still resolve to not hang Promise.all
                    return;
                }
                try {
                    var imageUrl = element.getAttribute("href");
                    if (!imageUrl) {
                        console.warn(`Element at index ${index} has no href. Skipping.`);
                        element.dataset.downloadAttemptedV4 = 'true';
                        resolveFile();
                        return;
                    }

                    var baseUrl = imageUrl.split('?')[0];
                    if (processedUrls.has(baseUrl)) {
                        console.log(`Skipping duplicate image URL for ${finalAlbumName}: ${baseUrl}`);
                        element.dataset.downloadAttemptedV4 = 'true';
                        resolveFile();
                        return;
                    }

                    var timestampMatch = imageUrl.match(/(\d+)$/);
                    var unixSeconds = timestampMatch ? parseInt(timestampMatch[1], 10) : Math.floor(Date.now() / 1000);
                    var originalFilenameMatch = baseUrl.match(/\/([^\/?]+)\.jpg/i);
                    var originalFilenamePart = originalFilenameMatch ? originalFilenameMatch[1] : `photo_${index}`;
                    var filename = `${finalAlbumName}_${originalFilenamePart}_img_${unixSeconds}_photo.jpg`;

                    if (element.tagName === 'A') {
                        element.setAttribute('download', filename);
                        element.click();
                        processedUrls.add(baseUrl);
                        downloadedCount++; // Increment here
                        console.log(`Initiated download (${downloadedCount} for this batch): ${filename}`);
                    } else {
                        console.warn(`Element at index ${index} is not an <a> tag. URL: ${imageUrl}`);
                    }
                } catch (error) {
                    console.error(`Error processing download for element at index ${index} (URL: ${element ? element.getAttribute("href") : 'N/A'}):`, error);
                } finally {
                     if(element) element.dataset.downloadAttemptedV4 = 'true';
                     resolveFile();
                }
            }, currentFileDelay);
        });
        downloadPromises.push(p);
    });

    return Promise.all(downloadPromises).then(() => {
        console.log(`All download initiations for album ${finalAlbumName} have been scheduled.`);
        return downloadedCount; // Return the final count for this batch
    });
}

// ====================================================================================
// MAIN ORCHESTRATION FUNCTION FOR RANGE DOWNLOAD (Updated to await downloader promise)
// ====================================================================================
async function automateRangeAndDownloadProcarePhotos() {
    if (typeof procarePhotoDownloaderV4 !== 'function') {
        alert("Error: The 'procarePhotoDownloaderV4' function is not defined. Please ensure the entire script block is pasted.");
        console.error("Error: 'procarePhotoDownloaderV4' function not found.");
        return;
    }

    const defaultStartYear = new Date().getFullYear();
    const defaultStartMonth = new Date().getMonth() + 1;
    const defaultEndYear = defaultStartYear;
    const defaultEndMonth = defaultStartMonth;

    const baseAlbumNameInput = prompt("Enter a BASE name for your photo albums (e.g., 'ChildName_Photos'). The script will add Year_Month to it:", "ProcarePhotos");
    if (!baseAlbumNameInput) { console.log("Base album name input cancelled. Aborting."); return; }

    const startYearInput = prompt("Enter START YEAR for the photo range (e.g., 2024):", defaultStartYear.toString());
    if (!startYearInput) { console.log("Start year input cancelled. Aborting."); return; }
    const startYear = parseInt(startYearInput);

    const startMonthInput = prompt("Enter START MONTH (1-12):", defaultStartMonth.toString());
    if (!startMonthInput) { console.log("Start month input cancelled. Aborting."); return; }
    const startMonth = parseInt(startMonthInput);

    const endYearInput = prompt("Enter END YEAR (e.g., 2025):", defaultEndYear.toString());
    if (!endYearInput) { console.log("End year input cancelled. Aborting."); return; }
    const endYear = parseInt(endYearInput);

    const endMonthInput = prompt("Enter END MONTH (1-12):", defaultEndMonth.toString());
    if (!endMonthInput) { console.log("End month input cancelled. Aborting."); return; }
    const endMonth = parseInt(endMonthInput);

    if (isNaN(startYear) || isNaN(startMonth) || startMonth < 1 || startMonth > 12 ||
        isNaN(endYear) || isNaN(endMonth) || endMonth < 1 || endMonth > 12 ||
        startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
        alert("Invalid date range. Start date must be before or same as end date, and months must be 1-12. Please try again.");
        console.error("Invalid date range provided.");
        return;
    }

    alert(`Automation will start for the date range:
Start: ${startMonth}/${startYear}
End: ${endMonth}/${endYear}
Base Album Name: ${baseAlbumNameInput}

The script will now proceed. Check the console for progress.
You will get a final alert once all download *initiations* are complete.`);

    let currentYear = startYear;
    let currentMonth = startMonth;
    let totalDownloadsInitiated = 0;
    const summary = [];

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const monthStr = currentMonth < 10 ? '0' + currentMonth : currentMonth.toString();
        const currentAlbumName = `${baseAlbumNameInput}_${currentYear}_${monthStr}`;
        
        console.log(`\n--- Processing: ${currentMonth}/${currentYear} ---`);
        summary.push(`\nProcessing ${currentMonth}/${currentYear} (Album: ${currentAlbumName}):`);

        const monthSelected = await selectProcareMonth_noAlerts(currentYear, currentMonth);
        if (!monthSelected) {
            console.error(`Failed to select ${currentMonth}/${currentYear}. Skipping this month.`);
            summary.push(`  - Failed to select month. Skipped.`);
        } else {
            summary.push(`  - Month selected successfully.`);
            console.log(`Waiting ${CONFIG.postMonthSelectionDelay / 1000} seconds for ${currentMonth}/${currentYear} to load...`);
            await wait(CONFIG.postMonthSelectionDelay);
            console.log("Wait finished.");

            const photosFoundCount = await autoScrollToLoadImages();
            if (photosFoundCount === 0) {
                console.log(`No photos found for ${currentMonth}/${currentYear} after scrolling. Skipping download.`);
                summary.push(`  - No photos found after scrolling. Skipped download.`);
            } else {
                summary.push(`  - Found ${photosFoundCount} photo items after scrolling.`);
                console.log(`Starting photo download process for ${currentMonth}/${currentYear}...`);
                // THIS IS THE KEY CHANGE: await the promise from procarePhotoDownloaderV4
                const downloadsThisMonth = await procarePhotoDownloaderV4(currentAlbumName);
                totalDownloadsInitiated += downloadsThisMonth;
                summary.push(`  - Initiated ${downloadsThisMonth} downloads.`);
            }
        }

        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        
        if (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
             console.log(`Waiting ${CONFIG.delayBetweenMonths / 1000} seconds before next month...`);
             await wait(CONFIG.delayBetweenMonths);
        }
    }

    console.log("\n--- All month processing and download initiations complete ---");
    console.log("Summary of operations:");
    summary.forEach(line => console.log(line));
    console.log(`\nTotal photo downloads initiated across all selected months: ${totalDownloadsInitiated}`);
    alert(`Automation script has finished processing all selected months.
All download initiations have been scheduled.
Please check your browser's download manager for the actual file completion.
Total photo downloads initiated: ${totalDownloadsInitiated}`);
}

// --- END OF FULL AUTOMATION SCRIPT (V2) ---

// To use:
// 1. Make sure you are on the Procare photo gallery page.
// 2. Open your browser's Developer Console (F12 -> Console tab).
// 3. Paste this entire script block into the console.
// 4. Type `automateRangeAndDownloadProcarePhotos();` and press Enter.
// 5. Follow the initial prompts for the date range and base album name.
