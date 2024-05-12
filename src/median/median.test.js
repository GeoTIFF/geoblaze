import { readFileSync } from "fs";
import test from "flug";
import { serve } from "srvd";
import load from "../load";
import median from ".";

serve({ debug: true, max: 6, port: 3000 });

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];
const expectedBboxValue = 915.85;

const bboxGeojson = `{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [83.583984375, 19.89072302399691], [86.1328125, 19.89072302399691],
        [86.1328125, 21.69826549685252], [83.583984375, 21.69826549685252],
        [83.583984375, 19.89072302399691]
      ]]
    }
  }]
}`;
const expectedBboxGeojsonValue = 1831.9;

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));
const expectedPolygonValue = 1637.35;

test("Get Median from Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(median(georaster, bbox)[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("Get Median from Bounding Box (GeoJSON)", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(median(georaster, bboxGeojson)[0].toFixed(2));
  eq(value, expectedBboxGeojsonValue);
});

test("Get Median from Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(median(georaster, polygon)[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test("Get Median from Whole Raster", async ({ eq }) => {
  const georaster = await load(url);
  const value = median(georaster)[0];
  eq(value, 0);
});

test("Get Median from Bounding Box from url", async ({ eq }) => {
  const result = await median(url, bbox);
  const value = Number(result[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("Get Median from Bounding Box (GeoJSON) from url", async ({ eq }) => {
  const result = await median(url, bboxGeojson);
  const value = Number(result[0].toFixed(2));
  eq(value, expectedBboxGeojsonValue);
});

test("Get Median from Polygon from url", async ({ eq }) => {
  const result = await median(url, polygon);
  const value = Number(result[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test("Get Median from Whole Raster from url", async ({ eq }) => {
  const result = await median(url);
  const value = result[0];
  eq(value, 0);
});

test("Get Median with virtual resampling, contained", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif";
  const geojson = await fetch("http://localhost:3000/data/virtual-resampling/virtual-resampling-one.geojson").then(res => res.json());
  const result = await median(url, geojson);
  eq(result, [38]);
});

test("virtual resampling, intersecting 4 pixels", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif";
  const geojson = await fetch("http://localhost:3000/data/virtual-resampling/virtual-resampling-intersect.geojson").then(res => res.json());
  const result = await median(url, geojson);
  eq(result, [38]);
});
