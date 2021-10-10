import test from "flug";
import { serve } from "srvd";
import load from "../load";
import parse from "../parse";
import get from "./get.module";

const urlRwanda = "http://localhost:3000/data/RWA_MNH_ANC.tif";
const bboxRwanda = require("../../data/RwandaBufferedBoundingBox.json");

const EXPECTED_HEIGHT = 712;
const EXPECTED_WIDTH = 995;
const EXPECTED_AREA = 708440;

serve({ debug: true, max: 1, port: 3000 });

test("(Legacy) Got Correct Flat Values when Geom bigger than Raster", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Legacy) Got Correct 2-D Values when Geom bigger than Raster", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_HEIGHT);
  eq(actualValues[0][0].length, EXPECTED_WIDTH);
});

test("(Legacy) Got Correct flat values for whole raster", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const flat = true;
  const actualValues = get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Legacy) Got Correct Flat Values when Geom bigger than Raster (from URL)", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Legacy) Got Correct 2-D Values when Geom bigger than Raster (from URL)", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const actualValues = get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_HEIGHT);
  eq(actualValues[0][0].length, EXPECTED_WIDTH);
});

test("(Legacy) Got Correct flat values for whole raster (from URL)", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const flat = true;
  const actualValues = get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

// modern
test("(Modern) Got Correct Flat Values when Geom bigger than Raster", async ({ eq }) => {
  const georaster = await parse(urlRwanda);
  const actualValues = await get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Modern) Got Correct 2-D Values when Geom bigger than Raster", async ({ eq }) => {
  const georaster = await parse(urlRwanda);
  const actualValues = await get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_HEIGHT);
  eq(actualValues[0][0].length, EXPECTED_WIDTH);
});

test("(Modern) Got Correct flat values for whole raster", async ({ eq }) => {
  const georaster = await parse(urlRwanda);
  const flat = true;
  const actualValues = await get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Modern) Got Correct Flat Values when Geom bigger than Raster (from URL)", async ({ eq }) => {
  const georaster = await parse(urlRwanda);
  const actualValues = await get(georaster, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Modern) Got Correct 2-D Values when Geom bigger than Raster (from URL)", async ({ eq }) => {
  const georaster = await parse(urlRwanda);
  const actualValues = await get(georaster, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_HEIGHT);
  eq(actualValues[0][0].length, EXPECTED_WIDTH);
});

test("(Modern) Got Correct flat values for whole raster (from URL)", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const flat = true;
  const actualValues = await get(georaster, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

// GeoRaster URL
test("(Modern) Got Correct Flat Values when Geom bigger than Raster [url source]", async ({ eq }) => {
  const actualValues = await get(urlRwanda, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Modern) Got Correct 2-D Values when Geom bigger than Raster [url source]", async ({ eq }) => {
  const actualValues = await get(urlRwanda, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_HEIGHT);
  eq(actualValues[0][0].length, EXPECTED_WIDTH);
});

test("(Modern) Got Correct flat values for whole raster [url source]", async ({ eq }) => {
  const flat = true;
  const actualValues = await get(urlRwanda, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Modern) Got Correct Flat Values when Geom bigger than Raster [url source]", async ({ eq }) => {
  const actualValues = await get(urlRwanda, bboxRwanda, true);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});

test("(Modern) Got Correct 2-D Values when Geom bigger than Raster [url source]", async ({ eq }) => {
  const actualValues = await get(urlRwanda, bboxRwanda, false);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_HEIGHT);
  eq(actualValues[0][0].length, EXPECTED_WIDTH);
});

test("(Modern) Got Correct flat values for whole raster [url source]", async ({ eq }) => {
  const flat = true;
  const actualValues = await get(urlRwanda, null, flat);
  eq(actualValues.length, 1);
  eq(actualValues[0].length, EXPECTED_AREA);
});
