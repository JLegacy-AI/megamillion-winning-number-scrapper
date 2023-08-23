import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import * as util from "util";
import * as fs from "fs";

const setTimeoutPromise = util.promisify(setTimeout);

const identifiers = {
  containersInOnePage: 10,
  date: "",
  containers: "draw-result-",
  result: "",
  million1: "",
  million2: "",
};

const getRandomDelay = () => {
  return Math.floor(Math.random() * (7000 - 5000 + 1) + 5000);
};

const start = async () => {
  console.log("Scrapping Start...");
  const browser = await puppeteer.launch({ headless: `new` });
  const page = await browser.newPage();
  const recentLotteryData = [];
  for (let i = 1; i <= 151; i++) {
    await page.goto(
      "https://www.illinoislottery.com/dbg/results/lotto?page=" + i,
      { waitUntil: "load", timeout: 100000 }
    );
    const content = await page.content();

    //   Passing HTML to Cheerio
    const $ = cheerio.load(content);
    // Lottery Recent Information

    // Container
    const containers = [];
    for (let i = 0; i < 10; i++) {
      const element = $(
        `li[data-test-id=${identifiers["containers"] + (i + 1)}]`
      );

      if (!element) break;

      containers.push(element);
    }
    // Extracting Data from Each Container
    containers.forEach((element, index) => {
      const date = element
        .find(`span[data-test-id=draw-result-info-date-${index + 1}]`)
        .text();
      const resultLinePrimary = element
        .find(`div[data-test-id=results-line-numbers-primary-${index + 1}]`)
        .text()
        .split(" ")
        .filter((value) => !isNaN(parseFloat(value.trim())))
        .map((e) => Number(e.trim()));
      const resultLineSecondary = element
        .find(`div[data-test-id=results-line-numbers-secondary-${index + 1}]`)
        .text()
        .split(" ")
        .filter((value) => !isNaN(parseFloat(value.trim())))
        .map((e) => Number(e.trim()));
      const resultLine = [...resultLinePrimary, ...resultLineSecondary];

      let millionOne = element
        .find(
          `div[data-test-id=results-line-numbers-extra-primary-1-${index + 1}]`
        )
        .text()
        .split(" ")
        .filter((value) => !isNaN(parseFloat(value.trim())))
        .map((e) => Number(e.trim()));
      millionOne = millionOne.slice(1, 7);

      let millionTwo = element
        .find(
          `div[data-test-id=results-line-numbers-extra-primary-2-${index + 1}]`
        )
        .text()
        .split(" ")
        .filter((value) => !isNaN(parseFloat(value.trim())))
        .map((e) => Number(e.trim()));

      millionTwo = millionTwo.slice(1, 7);

      recentLotteryData.push({
        date,
        resultLine,
        millionOne,
        millionTwo,
      });
    });
    console.log(`Page.No.${i} Scrapped Successfully~`);
    // const randomDelay = getRandomDelay();
    // await setTimeoutPromise(randomDelay);
  }

  const jsonData = JSON.stringify(recentLotteryData, null, 2);
  fs.writeFileSync("lotter-result-data.json", jsonData);
  console.log("Scrapping End...");
  browser.close();
};

start();
