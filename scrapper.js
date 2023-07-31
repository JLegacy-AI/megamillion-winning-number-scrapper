const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const util = require("util");
const fs = require("fs");

const setTimeoutPromise = util.promisify(setTimeout);

// Function to generate a random delay between 5000 ms and 7000 ms
const getRandomDelay = () => {
  return Math.floor(Math.random() * (7000 - 5000 + 1) + 5000);
};

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: `new` });
    const page = await browser.newPage();

    const url =
      "https://www.megamillions.com/Winning-Numbers/Previous-Drawings.aspx";

    await page.goto(url);

    // Define the number of times to click the "Load More" button
    const numOfLoadMoreClicks = 70;

    for (let i = 0; i < numOfLoadMoreClicks; i++) {
      await page.waitForSelector(".loadMoreBtn");
      await page.click(".loadMoreBtn");
      console.log("Button Pressed: ", i);

      // Generate a random delay between 5000 ms and 7000 ms
      const randomDelay = getRandomDelay();
      await setTimeoutPromise(randomDelay);
    }

    // After loading the data, extract the numbers from each page
    const pageContent = await page.content();
    const $ = cheerio.load(pageContent);
    const dates = $("h5.drawItemDate").map((ind, ele) => $(ele).text().trim());
    const numbers = $("ul.numbers li.ball")
      .map((index, element) => $(element).text().trim())
      .get();

    console.log(numbers.length);

    // Group the numbers into rows with six numbers in each row
    const rows = [];
    let j = 0;
    for (let i = 0; i < numbers.length; i += 6) {
      const row = [];
      row.push(dates[j]);
      row.push(...numbers.slice(i, i + 6));

      rows.push(row);
      j++;
    }

    // Store the numbers in a CSV file
    const csvData = rows.map((row) => row.join(",")).join("\n");

    fs.writeFileSync("numbers.csv", csvData);

    console.log("Data has been saved to numbers.csv");

    await browser.close();
  } catch (error) {
    console.error("Error during scraping:", error);
  }
})();
