'use strict';

const expect = require('chai').expect;
const load = require('./../load/load');
const rasterCalculator = require('./raster-calculator');

const url = 'http://localhost:3000/data/rgb_raster.tif';

const calculation1 = (a, b) => a + b;
const calculation2 = (a, b) => b - a * 2;
const calculation3 = (a, b, c) => 2 * a * c + 10;
const calculation4 = (a, b) => a > b ? 1 : 0;
const calculation5 = (a, b, c) => {
  if (a + b > c) return null;
  return a + b;
};

const test = () => {
  describe('Geoblaze Raster Calculator Feature', function() {
    describe('Run Calculation 1', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return rasterCalculator(georaster, calculation1).then(computedGeoraster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computedGeoraster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            expect(value).to.equal(calculation1(a, b));
          });
        });
      });
    });

    describe('Run Calculation 2', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return rasterCalculator(georaster, calculation2).then(computedGeoraster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computedGeoraster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            expect(value).to.equal(calculation2(a, b));
          });
        });
      });
    });

    describe('Run Calculation 3', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return rasterCalculator(georaster, calculation3).then(computedGeoraster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computedGeoraster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            const c = georaster.values[2][0][0];
            expect(value).to.equal(calculation3(a, b, c));
          });
        });
      });
    });

    describe('Run Calculation 4', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return rasterCalculator(georaster, calculation4).then(computedGeoraster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computedGeoraster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
          expect(value).to.equal(calculation4(a, b));
          });
        });
      });
    });

    describe('Run Calculation 5', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return rasterCalculator(georaster, calculation5).then(computedGeoraster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computedGeoraster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            const c = georaster.values[2][0][0];
            expect(value).to.equal(calculation5(a, b, c));
          });
        });
      });
    });
  });
}

test();

module.exports = test;
