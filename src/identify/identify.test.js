import test from "flug";
import { serve } from "srvd";
import reprojectGeoJSON from "reproject-geojson";
import load from "../load";
import identify from "./identify.module";

const url = "http://localhost:3000/data/test.tiff";
const point = [80.63, 7.42];
const expectedValue = 350.7;

serve({ debug: true, max: 1, port: 3000 });

test("(Legacy) Identified Point Correctly from file", async ({ eq }) => {
  const georaster = await load(url);
  const values = identify(georaster, point)[0];
  eq(values, expectedValue);
});

test("(Legacy) Try to identify point outside raster and correctly returned null from file", async ({ eq }) => {
  const georaster = await load(url);
  const values = identify(georaster, [-200, 7.42]);
  eq(values, null);
});

test("(Legacy) Identified Point Correctly from URL", async ({ eq }) => {
  const georaster = await load(url);
  const values = identify(georaster, point);
  eq(values[0], expectedValue);
});

test("(Legacy) Try to identify point outside raster and correctly returned null from URL", async ({ eq }) => {
  const georaster = await load(url);
  const values = identify(georaster, [-200, 7.42]);
  eq(values, null);
});

// modern
test("(Modern) Identified Point Correctly from file", async ({ eq }) => {
  const values = await identify(url, point);
  eq(values, [expectedValue]);
});

test("(Modern) Try to identify point outside raster and correctly returned null from file", async ({ eq }) => {
  const values = await identify(url, [-200, 7.42]);
  eq(values, null);
});

test("(Modern) Identified Point Correctly from URL", async ({ eq }) => {
  const values = await identify(url, point);
  eq(values, [expectedValue]);
});

test("(Modern) Try to identify point outside raster and correctly returned null from URL", async ({ eq }) => {
  const values = await identify(url, [-200, 7.42]);
  eq(values, null);
});

test("(Modern) Identified Point Correctly from file", async ({ eq }) => {
  const srs = 32617;
  const geom = await reprojectGeoJSON(point, { to: srs });
  const values = await identify(url, { srs, geometry: geom });
  eq(values, [expectedValue]);
});
