const { expect } = require('chai');
const puppeteer = require('puppeteer');

const url2GeoTIFF = 'http://localhost:3000/data/example_4326.tif';

describe('Loading Production Build', function() {
  this.timeout(5000);
  it('Should Successfully Require Production Build in Node', async () => {
    const geoblaze = require('./dist/geoblaze.node.min.js');
    expect(geoblaze).to.be.ok;
    const georaster = await geoblaze.load(url2GeoTIFF);
    const result = await geoblaze.median(georaster);
    expect(result[0]).to.equal(132);
  });

  it('Should Successfully Load Production Build in the Browser', async () => {
    const browser = await puppeteer.launch();
    const url = `http://localhost:3000/test/test-production-build.html`;
    const page = await browser.newPage();
    await page.goto(url);
    const result = await page.evaluate(() => window.promises.median);
    expect(result[0]).to.equal(132);
    browser.close();
  });
});

describe('Loading Development Build', function() {
  this.timeout(5000);
  it('Should Successfully Require Development Build in Node', async () => {
    const geoblaze = require('./dist/geoblaze.node.js');
    expect(geoblaze).to.be.ok;
    const georaster = await geoblaze.load(url2GeoTIFF);
    const result = await geoblaze.median(georaster);
    expect(result[0]).to.equal(132);
  });

  it('Should Successfully Load Development Build in the Browser', async () => {
    const browser = await puppeteer.launch();
    const url = `http://localhost:3000/test/test-dev-build.html`;
    const page = await browser.newPage();
    await page.goto(url);
    const result = await page.evaluate(() => window.promises.median);
    expect(result[0]).to.equal(132);
    browser.close();
  });
});
