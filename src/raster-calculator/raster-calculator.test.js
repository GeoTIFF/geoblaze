import test from "flug";
import { serve } from "srvd";
import load from "../load";
import rasterCalculator from "./raster-calculator.module";

serve({ debug: true, max: 3, port: 3000 });

const url = "http://localhost:3000/data/rgb/wildfires.tiff";

const calculation1 = (a, b) => a + b;
const calculation2 = (a, b) => b - a * 2;
const calculation3 = (a, b, c) => 2 * a * c + 10;
const calculation4 = (a, b) => (a > b ? 1 : 0);
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

const calculation9 = "return a > 200 ? 1 : 0;";

const calculation10 = "return A > 200 ? 1 : 0;";

function expectNoInfinityValues(georaster, eq) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        eq(pixel === Infinity, false);
      });
    });
  });
}

function expectNoNaNValues(georaster, eq) {
  georaster.values.forEach(band => {
    band.forEach(row => {
      row.forEach(pixel => {
        eq(isNaN(pixel), false);
      });
    });
  });
}

test("Run Calculation 1", async ({ eq }) => {
  const georaster = await load(url, { useCache: false });
  const computedGeoraster = await rasterCalculator(georaster, calculation1);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, calculation1(a, b));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 1 (Async)", async ({ eq }) => {
  const georaster = await load(url, { useCache: false });
  const computedGeoraster = await rasterCalculator(url, calculation1);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, calculation1(a, b));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 2", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation2);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, calculation2(a, b));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 3", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation3);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  const c = georaster.values[2][0][0];
  eq(value, calculation3(a, b, c));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 4", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation4);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  eq(value, calculation4(a, b));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 5", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation5);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  const c = georaster.values[2][0][0];
  eq(value, calculation5(a, b, c));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 6", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation6);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  const c = georaster.values[2][0][0];
  eq(value, calculation6(a, b, c));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 7", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation7);
  const value = computedGeoraster.values[0][0][0];
  const a = georaster.values[0][0][0];
  const b = georaster.values[1][0][0];
  const c = georaster.values[2][0][0];
  eq(value, calculation7(a, b, c));
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 8", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation8);
  expectNoNaNValues(computedGeoraster, eq);
});

test("Run Calculation 9", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation9);
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
  eq(numZeros, 823788);
  eq(numOnes, 980);
  expectNoInfinityValues(computedGeoraster, eq);
});

test("Run Calculation 10", async ({ eq }) => {
  const georaster = await load(url);
  const computedGeoraster = await rasterCalculator(georaster, calculation10);
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
  eq(numZeros, 823788);
  eq(numOnes, 980);
  expectNoInfinityValues(computedGeoraster, eq);
});
