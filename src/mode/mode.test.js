import { readFileSync } from "fs";
import test from "flug";
import { serve } from "srvd";
import load from "../load";
import mode from ".";

serve({ debug: true, max: 1, port: 3000 });

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
