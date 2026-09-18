import test from "flug";
import { serve } from "srvd";
import parseGeoraster from "georaster";
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

test("(Modern) Identified Same-SRS Point Correctly from file", async ({ eq }) => {
  const georaster = await load(url);
  const srs = georaster.projection;
  const geom = await reprojectGeoJSON(point, { to: srs });
  const values = identify(georaster, { srs, geometry: geom });
  eq(values, [expectedValue]);
});

test("Identify correctly handles points in pixel row 0 and column 0", async ({ eq }) => {
  const values = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]];
  const georaster = await parseGeoraster(values, {
    noDataValue: -1,
    projection: 4326,
    xmin: 0,
    ymax: 3,
    pixelWidth: 1,
    pixelHeight: 1,
  });

  eq(identify(georaster, [0.5, 2.5]), [1]);
  eq(identify(georaster, [1.5, 2.5]), [2]);
  eq(identify(georaster, [0.5, 1.5]), [4]);
  eq(identify(georaster, [1.5, 1.5]), [5]);
  eq(identify(georaster, [2.5, 0.5]), [9]);
});
