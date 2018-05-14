import { expect } from 'chai';
import load from '../load';
import rasterCalculator from './raster-calculator.module';

const url = 'http://localhost:3000/data/rgb/wildfires.tiff';

const calculation1 = (a, b) => a + b;
const calculation2 = (a, b) => b - a * 2;
const calculation3 = (a, b, c) => 2 * a * c + 10;
const calculation4 = (a, b) => a > b ? 1 : 0;
const calculation5 = (a, b, c) => {
  if (a + b > c) return null;
  return a + b;
};
const calculation6 = (a, b, c) => {
  return (a + b) / c;
};

// binarizing on red
const calculation7 = (a, b, c) => {
  if (a > 200 && b < 150 && c < 150) {
    return 1;
  } else {
    return 0;
  }
};

const calculation8 = () => NaN;

const calculation9 = 'return a > 200 ? 1 : 0;';

const calculation10 = 'return A > 200 ? 1 : 0;';

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

describe('Geoblaze Raster Calculator Feature', () => {
  describe('Run Calculation 1', function () {
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
        return rasterCalculator(georaster, calculation2).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          expect(value).to.equal(calculation2(a, b));
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
        return rasterCalculator(georaster, calculation3).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(calculation3(a, b, c));
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
        return rasterCalculator(georaster, calculation4).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          expect(value).to.equal(calculation4(a, b));
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
        return rasterCalculator(georaster, calculation5).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(calculation5(a, b, c));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 6', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        // const then = new Date().getTime();
        return rasterCalculator(georaster, calculation6).then(computedGeoraster => {
          // const now = new Date().getTime();
          // console.error('time: ', (now - then) / 1000);
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(calculation6(a, b, c));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 7', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        return rasterCalculator(georaster, calculation7).then(computedGeoraster => {
          const value = computedGeoraster.values[0][0][0];
          const a = georaster.values[0][0][0];
          const b = georaster.values[1][0][0];
          const c = georaster.values[2][0][0];
          expect(value).to.equal(calculation7(a, b, c));
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 8', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        return rasterCalculator(georaster, calculation8).then(computedGeoraster => {
          expectNoNaNValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 9', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        return rasterCalculator(georaster, calculation9).then(computedGeoraster => {
          let numZeros = 0;
          let numOnes = 0;
          computedGeoraster.values.forEach(band => {
            band.forEach(row => {
              row.forEach(pixel => {
                if (pixel === 0) {
                  numZeros++;
                } else if (pixel === 1) {
                  numOnes++;
                }
              });
            });
          });
          expect(numZeros).to.equal(823788);
          expect(numOnes).to.equal(980);
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });

  describe('Run Calculation 10', function () {
    this.timeout(1000000);
    it('Got Correct Value', () => {
      return load(url).then(georaster => {
        return rasterCalculator(georaster, calculation10).then(computedGeoraster => {
          let numZeros = 0;
          let numOnes = 0;
          computedGeoraster.values.forEach(band => {
            band.forEach(row => {
              row.forEach(pixel => {
                if (pixel === 0) {
                  numZeros++;
                } else if (pixel === 1) {
                  numOnes++;
                }
              });
            });
          });
          expect(numZeros).to.equal(823788);
          expect(numOnes).to.equal(980);
          expectNoInfinityValues(computedGeoraster);
        });
      });
    });
  });
});
