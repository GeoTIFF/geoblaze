'use strict';

const expect = require('chai').expect;
const load = require('./../load/load');
const band_arithmetic = require('./band-arithmetic');
const sum = require('../sum/sum');

const url = 'http://localhost:3000/data/rgb_raster.tif';
const geometry = JSON.parse('{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-124.63632922153921,50.4730947075256],[-124.68136768089609,50.49208460687918],[-124.69775722478518,50.543015499517765],[-124.61816815193745,50.57098391856333],[-124.55232914071532,50.58311475541861],[-124.57418505800888,50.50812939831994],[-124.56121949013325,50.46627096391081],[-124.63632922153921,50.4730947075256]]]}}');

const calculation_1 = 'a + b';
const get_expected_value_1 = (a, b) => a + b;

const calculation_2 = 'b - a * 2';
const get_expected_value_2 = (a, b) => b - a * 2;

const calculation_3 = '2a * c + 10';
const get_expected_value_3 = (a, c) => 2 * a * c + 10;

const calculation_4 = '(a - b)/(a + b)';
const get_expected_value_4 = (a, b) => (a - b) / (a + b);

const calculation_5 = '2(b + a * c) - 100';
const get_expected_value_5 = (a, b, c) => 2 * (b + a * c) - 100;

// left the time measuring code commented out in the tests to make
// it easier to return and further optimize the code

const test = () => {
  describe('Geoblaze Band Arithmetic Feature', function() {
    describe('Run Calculation 1', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return band_arithmetic(georaster, calculation_1).then(computed_georaster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computed_georaster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            expect(value).to.equal(get_expected_value_1(a, b));
          });
        });
      });
    });

    describe('Run Calculation 2', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return band_arithmetic(georaster, calculation_2).then(computed_georaster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computed_georaster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            expect(value).to.equal(get_expected_value_2(a, b));
          });
        });
      });
    });

    describe('Run Calculation 3', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return band_arithmetic(georaster, calculation_3).then(computed_georaster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computed_georaster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const c = georaster.values[2][0][0];
            expect(value).to.equal(get_expected_value_3(a, c));
          });
        });
      });
    });

    describe('Run Calculation 4', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return band_arithmetic(georaster, calculation_4).then(computed_georaster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computed_georaster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
          expect(value).to.equal(get_expected_value_4(a, b));
          });
        });
      });
    });

    describe('Run Calculation 5', function() {
      this.timeout(1000000);
      it('Got Correct Value', () => {
        return load(url).then(georaster => {
          // const then = new Date().getTime();
          return band_arithmetic(georaster, calculation_5).then(computed_georaster => {
            // const now = new Date().getTime();
            // console.error('time: ', (now - then) / 1000);
            const value = computed_georaster.values[0][0][0];
            const a = georaster.values[0][0][0];
            const b = georaster.values[1][0][0];
            const c = georaster.values[2][0][0];
            expect(value).to.equal(get_expected_value_5(a, b, c));
          });
        });
      });
    });
  });
}

test();

module.exports = test;
