require("dotenv").config();

const { getListings } = require("./services/ivyService");
const fs = require("fs");

async function downloadData() {
  try {
    console.log("Starting download...");

    const firstPage = await getListings(1, 50);

    console.log("Total listings:", firstPage.total);
    console.log("First page records:", firstPage.results.length);

    const allListings = [...firstPage.results];

    const pageSize = firstPage.results.length;
    const totalPages = Math.ceil(firstPage.total / pageSize);

    console.log("Actual page size:", pageSize);
    console.log("Total pages:", totalPages);

    for (let page = 2; page <= totalPages; page++) {
      console.log(`Downloading page ${page}/${totalPages}...`);

      const data = await getListings(page, 50);
      allListings.push(...data.results);
    }

    console.log("Downloaded listings:", allListings.length);

    fs.writeFileSync(
      "data/listings.json",
      JSON.stringify(allListings, null, 2)
    );

    console.log("Saved to data/listings.json");
  } catch (error) {
    console.error("Download failed:", error);
  }
}

downloadData();
