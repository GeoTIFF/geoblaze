import test from "flug";
import { serve } from "srvd";
import range from ".";

serve({ debug: true, max: 20, port: 3000 });

const url = "http://localhost:3000/data/test.tiff";
const bbox = [80.63, 7.42, 84.21, 10.1];
const expectedBboxValue = 5166.7;

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

test("(Modern) Get Range from Bounding Box", async ({ eq }) => {
  const results = await range(url, bbox);
  const value = Number(results[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("(Modern) Get Range from Polygon", async ({ eq }) => {
  const results = await range(url, polygon);
  const value = Number(results[0].toFixed(2));
  eq(value, 7807.4);
});

test("(Modern) Get Range from whole Raster", async ({ eq }) => {
  const results = await range(url);
  eq(results, [8131.2]);
});
