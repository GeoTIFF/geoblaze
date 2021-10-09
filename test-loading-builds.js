const test = require('flug');
const { serve } = require('srvd');
const puppeteer = require('puppeteer');

const { port } = serve({ debug: true, max: 6, port: 3000 });

const url2GeoTIFF = `http://localhost:${port}/data/example_4326.tif`;


test('Should Successfully Require Production Build in Node', async ({ eq }) => {
  const geoblaze = require('./dist/geoblaze.node.min.js');
  eq(typeof geoblaze, "object");
  const georaster = await geoblaze.load(url2GeoTIFF);
  const result = await geoblaze.median(georaster);
  eq(result[0], 132);
});

test('Should Successfully Load Production Build in the Browser', async ({ eq }) => {
  const browser = await puppeteer.launch();
  const url = `http://localhost:3000/test/test-production-build.html`;
  const page = await browser.newPage();
  await page.goto(url);
  const result = await page.evaluate(() => window.promises.median);
  eq(result[0], 132);
  browser.close();
});

test('Should Successfully Require Development Build in Node', async ({ eq }) => {
  const geoblaze = require('./dist/geoblaze.node.js');
  eq(typeof geoblaze, "object");
  const georaster = await geoblaze.load(url2GeoTIFF);
  const result = await geoblaze.median(georaster);
  eq(result[0], 132);
});

test('Should Successfully Load Development Build in the Browser', async ({ eq }) => {
  const browser = await puppeteer.launch();
  const url = `http://localhost:3000/test/test-dev-build.html`;
  const page = await browser.newPage();
  await page.goto(url);
  const result = await page.evaluate(() => window.promises.median);
  eq(result[0], 132);
  browser.close();
});
