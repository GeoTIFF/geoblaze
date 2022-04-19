import test from "flug";
import { serve } from "srvd";
import load from "../load";
import mean from "./mean.module";
import utils from "../utils";

serve({ debug: true, max: 2, port: 3000 });

const { round } = utils;

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];
const expectedBboxValue = 1232.47;

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
const expectedPolygonValue = 1801.47;

const polygonGeojson = `{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [83.12255859375, 22.49225722008518], [82.96875, 21.57571893245848], [81.58447265624999,  1.207458730482642],
          [83.07861328125, 20.34462694382967], [83.8037109375,  19.497664168139053], [84.814453125, 19.766703551716976],
          [85.078125, 21.166483858206583], [86.044921875, 20.838277806058933], [86.98974609375, 22.49225722008518],
          [85.58349609375, 24.54712317973075], [84.6826171875, 23.36242859340884], [83.12255859375, 22.49225722008518]
        ]]
      },
      "properties": {
        "prop0": "value0",
        "prop1": {"this": "that"}
      }
     }
  ]
}`;
const expectedPolygonGeojsonValue = 1801.47;

test("(Legacy) Mean without Geometry", async ({ eq }) => {
  const georaster = await load(url);
  const results = mean(georaster);
  const value = round(results[0]);
  eq(value, 132.04);
});

test("(Legacy) Mean with Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = mean(georaster, bbox);
  const value = round(results[0]);
  eq(value, expectedBboxValue);
});

test("(Legacy) Mean with Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = mean(georaster, polygon);
  const value = round(results[0]);
  eq(value, expectedPolygonValue);
});

test("(Legacy) Mean from GeoJSON", async ({ eq }) => {
  const georaster = await load(url);
  const results = mean(georaster, polygonGeojson);
  const value = round(results[0]);
  eq(value, expectedPolygonGeojsonValue);
});

// Modernized Async
test("(Modern) Mean without Geometry", async ({ eq }) => {
  const results = await mean(url);
  const value = round(results[0]);
  eq(value, 132.04);
});

test("(Modern) Mean with Bounding Box", async ({ eq }) => {
  const results = await mean(url, bbox);
  const value = round(results[0]);
  eq(value, expectedBboxValue);
});

test("(Modern) Mean with Polygon", async ({ eq }) => {
  const results = await mean(url, polygon);
  const value = round(results[0]);
  eq(value, expectedPolygonValue);
});

test("(Modern) Mean from GeoJSON", async ({ eq }) => {
  const results = await mean(url, polygonGeojson);
  const value = round(results[0]);
  eq(value, expectedPolygonGeojsonValue);
});
