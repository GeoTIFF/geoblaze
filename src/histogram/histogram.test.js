import { readFileSync } from "fs";
import test from "flug";
import { serve } from "srvd";
import load from "../load";
import histogram from "./histogram.module";

serve({ debug: true, max: 2, port: 3000 });

const ratioQuantileOptions = {
  scaleType: "ratio",
  numClasses: 7,
  classType: "quantile"
};

const ratioEIOptions = {
  scaleType: "ratio",
  numClasses: 7,
  classType: "equal-interval"
};

const ratioEIGeorasterResults = {
  "74 - 99.86": 140,
  ">99.86 - 125.71": 426,
  ">125.71 - 151.57": 305,
  ">151.57 - 177.43": 140,
  ">177.43 - 203.29": 62,
  ">203.29 - 229.14": 49,
  ">229.14 - 255": 78
};

const ratioQuantileBboxResults = {
  "0 - 97.1": 27,
  ">97.1 - 272": 27,
  ">272 - 733.5": 27,
  ">733.5 - 1176.9": 27,
  ">1176.9 - 1592.1": 27,
  ">1592.1 - 2672.4": 27,
  ">2672.4 - 5166.7": 27
};

const ratioQuantilePolygonResults = {
  "0 - 170.4": 239,
  ">170.4 - 744.9": 239,
  ">744.9 - 1306.8": 239,
  ">1306.8 - 1982": 239,
  ">1982 - 2588.8": 239,
  ">2588.8 - 3483.6": 239,
  ">3483.6 - 7807.4": 239
};

const ratioEIPolygonResults = {
  "0 - 1115.34": 679,
  ">1115.34 - 2230.69": 358,
  ">2230.69 - 3346.03": 337,
  ">3346.03 - 4461.37": 162,
  ">4461.37 - 5576.71": 75,
  ">5576.71 - 6692.06": 22,
  ">6692.06 - 7807.4": 9
};

const url = "http://localhost:3000/data/test.tiff";
const urlSmallRaster = "http://localhost:3000/data/example_4326.tif";

const bbox = [80.63, 7.42, 84.21, 10.1];

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));

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

test("(Legacy) Get Histogram (Ratio, Equal Interval) from GeoRaster", async ({ eq }) => {
  const georaster = await load(urlSmallRaster);
  const results = histogram(georaster, null, ratioEIOptions)[0];
  eq(results, ratioEIGeorasterResults);
});

test("(Legacy) Get Histogram (Ratio, Quantile) from Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = histogram(georaster, bbox, ratioQuantileOptions)[0];
  eq(results, ratioQuantileBboxResults);
});

test("(Legacy) Get Histogram (Ratio, Quantile) from Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = histogram(georaster, polygon, ratioQuantileOptions)[0];
  eq(results, ratioQuantilePolygonResults);
});

test("(Legacy) Get Histogram (Ratio, Equal Interval) from Polygon (GeoJSON)", async ({ eq }) => {
  const georaster = await load(url);
  const results = histogram(georaster, polygonGeojson, ratioEIOptions)[0];
  eq(results, ratioEIPolygonResults);
});

// MODERN
test("(Modern) Get Histogram (Ratio, Equal Interval) from GeoRaster", async ({ eq }) => {
  const results = await histogram(urlSmallRaster, null, ratioEIOptions);
  eq(results[0], ratioEIGeorasterResults);
});

test("(Modern) Get Histogram (Ratio, Quantile) from Bounding Box", async ({ eq }) => {
  const results = await histogram(url, bbox, ratioQuantileOptions);
  eq(results[0], ratioQuantileBboxResults);
});

test("(Modern) Get Histogram (Ratio, Quantile) from Polygon", async ({ eq }) => {
  const results = await histogram(url, polygon, ratioQuantileOptions);
  eq(results[0], ratioQuantilePolygonResults);
});

test("(Modern) Get Histogram (Ratio, Equal Interval) from Polygon (GeoJSON)", async ({ eq }) => {
  const results = await histogram(url, polygonGeojson, ratioEIOptions);
  eq(results[0], ratioEIPolygonResults);
});
