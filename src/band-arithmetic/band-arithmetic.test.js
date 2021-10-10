import test from "flug";
import { serve } from "srvd";
import get from "../get";
import load from "../load";
import parse from "../parse";
import bandArithmetic from "./band-arithmetic.module";

// url is cached so only need 1 request
serve({ debug: true, max: 1, port: 3000 });

const url = "http://localhost:3000/data/rgb/wildfires.tiff";

const calculation1 = "a + b";
const getExpectedValue1 = (a, b) => a + b;

const calculation2 = "b - a * 2";
const getExpectedValue2 = (a, b) => b - a * 2;

const calculation3 = "2a * c + 10";
const getExpectedValue3 = (a, c) => 2 * a * c + 10;

const calculation4 = "(a - b)/(a + b)";
const getExpectedValue4 = (a, b) => (a - b) / (a + b);

const calculation5 = "2(b + a * c) - 100";
const getExpectedValue5 = (a, b, c) => 2 * (b + a * c) - 100;

const calculation6 = "(a + b) / c";
const getExpectedValue6 = (a, b, c) => (a + b) / c;

const calculation7 = "(a - a) / (b - b)";

function expectNoInfinityValues({ georaster, eq }) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        eq(pixel === Infinity, false);
      });
    });
  });
}

function expectNoNaNValues({ georaster, eq }) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        eq(isNaN(pixel), false);
      });
    });
  });
}

test("(Legacy) Band Arithmetic: Run Calculation 1", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation1);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  eq(value, getExpectedValue1(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Legacy) Band Arithmetic: Run Calculation 2", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation2);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  eq(value, getExpectedValue2(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Legacy) Band Arithmetic: Run Calculation 3", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation3);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const c = originalValues[2][0][0];
  eq(value, getExpectedValue3(a, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Legacy) Band Arithmetic: Run Calculation 4", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation4);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  eq(value, getExpectedValue4(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Legacy) Band Arithmetic: Run Calculation 5", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation5);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  const c = originalValues[2][0][0];
  eq(value, getExpectedValue5(a, b, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Legacy) Band Arithmetic: Run Calculation 6", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation6);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  const c = originalValues[2][0][0];
  eq(value, getExpectedValue6(a, b, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Legacy) Band Arithmetic: Run Calculation 7", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await bandArithmetic(georaster, calculation7);
  expectNoNaNValues({ georaster: computedGeoraster, eq });
});

// MODERN
test("(Modern) Band Arithmetic: Run Calculation 1", async ({ eq }) => {
  const georaster = await parse(url);
  const computedGeoraster = await bandArithmetic(url, calculation1);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  eq(value, getExpectedValue1(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Modern) Band Arithmetic: Run Calculation 2", async ({ eq }) => {
  const georaster = await parse(url);
  const computedGeoraster = await bandArithmetic(url, calculation2);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  eq(value, getExpectedValue2(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Modern) Band Arithmetic: Run Calculation 3", async ({ eq }) => {
  const georaster = await parse(url);
  const computedGeoraster = await bandArithmetic(url, calculation3);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const c = originalValues[2][0][0];
  eq(value, getExpectedValue3(a, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Modern) Band Arithmetic: Run Calculation 4", async ({ eq }) => {
  const georaster = await parse(url);
  const computedGeoraster = await bandArithmetic(url, calculation4);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  eq(value, getExpectedValue4(a, b));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Modern) Band Arithmetic: Run Calculation 5", async ({ eq }) => {
  const georaster = await parse(url);
  const computedGeoraster = await bandArithmetic(url, calculation5);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  const c = originalValues[2][0][0];
  eq(value, getExpectedValue5(a, b, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Modern) Band Arithmetic: Run Calculation 6", async ({ eq }) => {
  const georaster = await parse(url);
  const computedGeoraster = await bandArithmetic(url, calculation6);
  const value = computedGeoraster.values[0][0][0];
  const originalValues = await get(georaster);
  const a = originalValues[0][0][0];
  const b = originalValues[1][0][0];
  const c = originalValues[2][0][0];
  eq(value, getExpectedValue6(a, b, c));
  expectNoInfinityValues({ georaster: computedGeoraster, eq });
});

test("(Modern) Band Arithmetic: Run Calculation 7", async ({ eq }) => {
  const computedGeoraster = await bandArithmetic(url, calculation7);
  expectNoNaNValues({ georaster: computedGeoraster, eq });
});
