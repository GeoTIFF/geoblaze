import test from "flug";
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

function expectNoInfinityValues ({ georaster, eq }) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        eq(pixel === Infinity, false);
      });
    });
  });
}

function expectNoNaNValues ({ georaster, eq }) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        eq(pixel === NaN, false);
      });
    });
  });
}
// left the time measuring code commented out in the tests to make
// it easier to return and further optimize the code

test('Band Arithmetic: Run Calculation 1', async function ({ eq }) {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation1);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, getExpectedValue1(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test('Band Arithmetic: Run Calculation 2', async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation2);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, getExpectedValue2(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test('Band Arithmetic: Run Calculation 3', async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation3);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const c = georaster.values[2][0][0];
  eq(value, getExpectedValue3(a, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test('Band Arithmetic: Run Calculation 3', async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation4);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, getExpectedValue4(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test('Band Arithmetic: Run Calculation 3', async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation5);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  const c = georaster.values[2][0][0];
  eq(value, getExpectedValue5(a, b, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test('Band Arithmetic: Run Calculation 6', async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation6);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  const c = georaster.values[2][0][0];
  eq(value, getExpectedValue6(a, b, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test('Band Arithmetic: Run Calculation 7', async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation7);
  expectNoNaNValues({ georaster: computedGeoraster, eq });
});
