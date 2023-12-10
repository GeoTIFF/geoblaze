import { readFileSync } from "fs";
import test from "flug";
import reprojectBoundingBox from "reproject-bbox";
import { serve } from "srvd";
import load from "../load";
import max from ".";

serve({ debug: true, max: 1, port: 3000 });

const url = "http://localhost:3000/data/test.tiff";

const bbox = [80.63, 7.42, 84.21, 10.1];
const bbox3857 = reprojectBoundingBox({ bbox, from: 4326, to: 3857 });
const expectedBboxValue = 5166.7;

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));
const expectedPolygonValue = 7807.4;

test("(Legacy) Max without Geometry", async ({ eq }) => {
  const georaster = await load(url);
  const value = max(georaster)[0];
  eq(value, 8131.2);
});

test("(Legacy) Max with Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(max(georaster, bbox)[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("(Legacy) Max with Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(max(georaster, polygon)[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test("(Modern) Max without Geometry", async ({ eq }) => {
  eq(await max(url), [8131.2]);
});

test("(Modern) Got Correct Get Max from Bounding Box", async ({ eq }) => {
  const result = await max(url, bbox);
  const value = Number(result[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("(Modern) Get Max from Polygon", async ({ eq }) => {
  const result = await max(url, polygon);
  const value = Number(result[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test("Max with Web Mercator Bounding Box and GeoRaster Object", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(max(georaster, { srs: 3857, geometry: bbox3857 })[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("Max with Web Mercator Bounding Box and GeoRaster URL", async ({ eq }) => {
  const result = await max(url, { srs: 3857, geometry: bbox3857 });
  const value = Number(result[0].toFixed(2));
  eq(value, expectedBboxValue);
});
