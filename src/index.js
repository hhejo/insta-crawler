import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const baseUrl = 'https://www.instagram.com/hoseofood/';
await page.goto(baseUrl);
await page.setViewport({ width: 1080, height: 1024 });
await page.mouse.click(5, 5);

// 게시물 목록
const selector = 'main article a';
await page.waitForSelector(selector, { timeout: 10000 });
const href = await page.$eval(selector, (el) => el.href);
console.log('href:', href);

// 게시글 상세 조회
const detailUrl = href;
await page.goto(detailUrl);
await page.mouse.click(5, 5);
const textSelector = 'section main article ul li h1';
await page.waitForSelector(textSelector, { timeout: 10000 });
const element = await page.$(textSelector);
console.log('element:', element);
const text = await page.evaluate((el) => el.textContent, element);
console.log(text);

await browser.close();

//
//
//
//
//

await page.goto(href, { waitUntil: 'networkidle0' });
const xpathSrc =
  '::-p-xpath(/html/body/div[2]/div/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div[2]/div[1]/article/div/div[1]/div/div[1]/div[2]/div/div/div/ul/li[2]/div/div/div/div/div[1]/img)';
const src = await page.$eval(xpathSrc, (el) => el.src);

await page.goto(src, { waitUntil: 'networkidle0' });

function downloadImage(url, filePath) {
  const file = fs.createWriteStream(filePath);
  https
    .get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close());
    })
    .on('error', (err) => fs.unlink(filePath));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFilePath = path.resolve(__dirname, '../today-food.jpg');
downloadImage(src, outputFilePath);

await browser.close();
