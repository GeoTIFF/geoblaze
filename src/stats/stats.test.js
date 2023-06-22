import test from "flug";
import { readFileSync } from "fs";
import { serve } from "srvd";
import parseGeoraster from "georaster";
import fetch from "cross-fetch";

import load from "../load";
import stats from "./stats.module";

serve({ debug: true, max: 8, port: 3000, wait: 240 });

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));

const EXPECTED_RASTER_STATS = [
  {
    count: 820517,
    invalid: 0,
    max: 8131.2,
    mean: 132.04241399017369,
    median: 0,
    min: 0,
    mode: 0,
    modes: [0],
    range: 8131.2,
    std: 562.8169687364914,
    sum: 108343045.39997534,
    valid: 820517,
    variance: 316762.94029773277
  }
];

const EXPECTED_BBOX_STATS = [
  {
    count: 213,
    invalid: 0,
    max: 5166.7,
    mean: 1232.4718309859154,
    median: 906.7,
    min: 0,
    mode: 0,
    modes: [0],
    range: 5166.7,
    std: 1195.3529916721104,
    sum: 262516.5,
    valid: 213,
    variance: 1428868.7746994647
  }
];

const EXPECTED_POLYGON_STATS = [
  {
    count: 1672, // rasterstats says 1672
    invalid: 0, // expected because geoblaze ignores no data values (but maybe this isn't ideal?)
    max: 7807.4,
    mean: 1853.7104066985623,
    median: 1637.35,
    min: 0,
    mode: 0,
    modes: [0],
    range: 7807.4,
    std: 1507.3255322956486,
    sum: 3_099_403.799999996, // rasterstats says 3,099,403.8
    valid: 1672,
    variance: 2_272_030.2603103607
  }
];

test("(Sync) Stats without Geometry", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, undefined);
  results.forEach(band => {
    delete band.uniques;
    delete band.histogram;
  });
  eq(results, EXPECTED_RASTER_STATS);
});

test("(Async) Stats without Geometry", async ({ eq }) => {
  const results = await stats(url, undefined);
  results.forEach(band => {
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_RASTER_STATS);
});

test("(Sync) Stats with Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, bbox);
  results.forEach(band => {
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_BBOX_STATS);
});

test("(Async) Stats with Bounding Box", async ({ eq }) => {
  const results = await stats(url, bbox);
  results.forEach(band => {
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_BBOX_STATS);
});

test("(Sync) Stats with Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, polygon);
  results.forEach(band => {
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_POLYGON_STATS);
});

test("(Async) Stats with Polygon", async ({ eq }) => {
  const results = await stats(url, polygon);
  results.forEach(band => {
    delete band.histogram;
    delete band.uniques;
  });
  eq(results, EXPECTED_POLYGON_STATS);
});

test("hole", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/gadas-4326.tif";
  const url_to_geometry = "http://localhost:3000/data/holes/hole.geojson";
  const geometry = await fetch(url_to_geometry).then(r => r.json());
  const results = await stats(url, geometry);
  const mode = results.map(stats => stats.mode);
  eq(mode, [61, 133, 170, 255]); // #3d85aad9
});

test("Hole Test", async ({ eq }) => {
  const georaster = await parseGeoraster(
    [
      [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ]
    ],
    {
      noDataValue: 0,
      projection: 4326,
      xmin: 0, // left
      ymax: 20, // top
      pixelWidth: 5,
      pixelHeight: 5
    }
  );
  const url = "http://localhost:3000/data/holes/hole-2.geojson";
  const geojson = await fetch(url).then(res => res.json());
  const results = await stats(georaster, geojson);
  eq(results[0].count, 12);
  eq(results[0].sum, 12);
});
