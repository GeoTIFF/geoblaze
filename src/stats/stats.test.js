import test from "flug";
import { serve } from "srvd";
import load from "../load";
import stats from "./stats.module";

serve({ debug: true, max: 1, port: 3000 });

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];

const polygon = [
  [
    [83.12255859375, 22.49225722008518],
    [82.96875, 21.57571893245848],
    [81.58447265624999, 1.207458730482642],
    [83.07861328125, 20.34462694382967],
    [83.8037109375, 19.497664168139053],
    [84.814453125, 19.766703551716976],
    [85.078125, 21.166483858206583],
    [86.044921875, 20.838277806058933],
    [86.98974609375, 22.49225722008518],
    [85.58349609375, 24.54712317973075],
    [84.6826171875, 23.36242859340884],
    [83.12255859375, 22.49225722008518]
  ]
];

const EXPECTED_RASTER_STATS = [
  {
    median: 0,
    min: 0,
    max: 8131.2,
    sum: 108343045.39997534,
    mean: 132.04241399017369,
    modes: [0],
    mode: 0
  }
];

const EXPECTED_BBOX_STATS = [
  {
    median: 906.7,
    min: 0,
    max: 5166.7,
    sum: 262516.5,
    mean: 1232.4718309859154,
    modes: [0],
    mode: 0
  }
];

const EXPECTED_POLYGON_STATS = [{ "median":1537.2,"min":0,"max":7807.4,"sum":3125542.199999998,"mean":1801.4652449567711,"modes":[0],"mode":0 }];

test("(Sync) Stats without Geometry", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, undefined);
  results.forEach(band => delete band.histogram);
  eq(results, EXPECTED_RASTER_STATS);
});

test("(Async) Stats without Geometry", async ({ eq }) => {
  const results = await stats(url, undefined);
  results.forEach(band => delete band.histogram);
  eq(results, EXPECTED_RASTER_STATS);
});

test("(Sync) Stats with Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, bbox);
  results.forEach(band => delete band.histogram);
  eq(results, EXPECTED_BBOX_STATS);
});

test("(Async) Stats with Bounding Box", async ({ eq }) => {
  const results = await stats(url, bbox);
  results.forEach(band => delete band.histogram);
  eq(results, EXPECTED_BBOX_STATS);
});

test("(Sync) Stats with Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = stats(georaster, polygon);
  results.forEach(band => delete band.histogram);
  eq(results, EXPECTED_POLYGON_STATS);
});

test("(Async) Stats with Polygon", async ({ eq }) => {
  const results = await stats(url, polygon);
  results.forEach(band => delete band.histogram);
  eq(results, EXPECTED_POLYGON_STATS);
});
