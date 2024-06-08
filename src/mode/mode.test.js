import { readFileSync } from "fs";
import test from "flug";
import { serve } from "srvd";
import load from "../load";
import mode from ".";

serve({ debug: true, max: 5, port: 3000 });

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));

test("(Legacy) Mode without Geometry", async ({ eq }) => {
  const georaster = await load(url);
  const results = mode(georaster);
  eq(results, [0]);
});

test("(Legacy) Mode with Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = mode(georaster, bbox);
  eq(results, [0]);
});

test("(Legacy) Mode with Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = mode(georaster, polygon);
  eq(results, [0]);
});

test("(Modern) Mode without Geometry", async ({ eq }) => {
  const results = await mode(url);
  eq(results, [0]);
});

test("(Modern) Mode with Bounding Box", async ({ eq }) => {
  const results = await mode(url, bbox);
  eq(results, [0]);
});

test("(Modern) Mode Polygon", async ({ eq }) => {
  const results = await mode(url, polygon);
  eq(results, [0]);
});

test("virtual resampling, contained", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif";
  const geojson = await fetch("http://localhost:3000/data/virtual-resampling/virtual-resampling-one.geojson").then(res => res.json());
  const result = await mode(url, geojson);
  eq(result, [38]);
});

test("virtual resampling, intersecting 4 pixels", async ({ eq }) => {
  const url = "http://localhost:3000/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif";
  const geojson = await fetch("http://localhost:3000/data/virtual-resampling/virtual-resampling-intersect.geojson").then(res => res.json());
  const result = await mode(url, geojson);
  eq(result, [38]);
});
