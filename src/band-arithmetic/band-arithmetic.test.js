import { expect } from 'chai';
import load from '../load';
import bandArithmetic from './band-arithmetic.module';

const url = 'http://localhost:3000/data/rgb/wildfires.tiff';

const calculation1 = 'a + b';
const getExpectedValue1 = (a, b) => a + b;

const calculation2 = 'b - a * 2';
const getExpectedValue2 = (a, b) => b - a * 2;

const calculation3 = '2a * c + 10';
const getExpectedValue3 = (a, c) => 2 * a * c + 10;

const calculation4 = '(a - b)/(a + b)';
const getExpectedValue4 = (a, b) => (a - b) / (a + b);

const calculation5 = '2(b + a * c) - 100';
const getExpectedValue5 = (a, b, c) => 2 * (b + a * c) - 100;

const calculation6 = '(a + b) / c';
const getExpectedValue6 = (a, b, c) => (a + b) / c;

const calculation7 = '(a - a) / (b - b)';

function expectNoInfinityValues (georaster) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        expect(pixel).to.not.equal(Infinity);
      });
    });
  });
}

function expectNoNaNValues (georaster) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        expect(pixel).to.not.equal(NaN);
      });
    });
  });
}
// left the time measuring code commented out in the tests to make
// it easier to return and further optimize the code

describe('Geoblaze Band Arithmetic Feature', () => {
  describe('Run Calculation 1', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        // const then = new Date().getTime();
        return bandArithmetic(georaster, calculation1).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          expect(value).to.equal(getExpectedValue1(a, b));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 2', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        // const then = new Date().getTime();
        return bandArithmetic(georaster, calculation2).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          expect(value).to.equal(getExpectedValue2(a, b));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 3', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        // const then = new Date().getTime();
        return bandArithmetic(georaster, calculation3).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(getExpectedValue3(a, c));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 4', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        // const then = new Date().getTime();
        return bandArithmetic(georaster, calculation4).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          expect(value).to.equal(getExpectedValue4(a, b));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });
  describe('Run Calculation 5', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        // const then = new Date().getTime();
        return bandArithmetic(georaster, calculation5).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(getExpectedValue5(a, b, c));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 6', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        return bandArithmetic(georaster, calculation6).then(computedGeoraster => {
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(getExpectedValue6(a, b, c));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 7', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        return bandArithmetic(georaster, calculation7).then(computedGeoraster => {
          expectNoNaNValues(computedGeoraster);
        });
      });
    });
  });
});
