import test from "flug";
import { serve } from "srvd";
import load from "../load";
import mode from "./mode.module";

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
