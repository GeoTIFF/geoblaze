const { expect } = require('chai');
const puppeteer = require('puppeteer');

describe('Loading Production Build', function() {
  it('Should Successfully Require Production Build in Node', () => {
    const geoblaze = require('./dist/geoblaze.min.js');
    expect(geoblaze).to.be.ok;
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
  it('Should Successfully Require Development Build in Node', () => {
    const geoblaze = require('./dist/geoblaze.js');
    expect(geoblaze).to.be.ok;
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
