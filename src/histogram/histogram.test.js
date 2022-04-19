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
  "0 - 93.2": 31,
  ">93.2 - 272": 31,
  ">272 - 724": 31,
  ">724 - 1141.9": 31,
  ">1141.9 - 1700.6": 31,
  ">1700.6 - 2732.4": 31,
  ">2732.4 - 5166.7": 28
};

const ratioQuantilePolygonResults = {
  "0 - 121.2": 248,
  ">121.2 - 655.5": 248,
  ">655.5 - 1169.2": 248,
  ">1169.2 - 1925.4": 248,
  ">1925.4 - 2556.2": 248,
  ">2556.2 - 3455.1": 248,
  ">3455.1 - 7807.4": 248
};

const ratioEIPolygonResults = {
  "0 - 1115.34": 727,
  ">1115.34 - 2230.69": 379,
  ">2230.69 - 3346.03": 358,
  ">3346.03 - 4461.37": 163,
  ">4461.37 - 5576.71": 74,
  ">5576.71 - 6692.06": 25,
  ">6692.06 - 7807.4": 9
};

const url = "http://localhost:3000/data/test.tiff";
const urlSmallRaster = "http://localhost:3000/data/example_4326.tif";

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
  Object.keys(ratioEIGeorasterResults).forEach(key => {
    const value = results[key];
    const expectedValue = ratioEIGeorasterResults[key];
    eq(value, expectedValue);
  });
});

test("(Legacy) Get Histogram (Ratio, Quantile) from Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = histogram(georaster, bbox, ratioQuantileOptions)[0];
  Object.keys(ratioQuantileBboxResults).forEach(key => {
    const value = results[key];
    const expectedValue = ratioQuantileBboxResults[key];
    eq(value, expectedValue);
  });
});

test("(Legacy) Get Histogram (Ratio, Quantile) from Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const results = histogram(georaster, polygon, ratioQuantileOptions)[0];
  Object.keys(ratioQuantilePolygonResults).forEach(key => {
    const value = results[key];
    const expectedValue = ratioQuantilePolygonResults[key];
    eq(value, expectedValue);
  });
});

test("(Legacy) Get Histogram (Ratio, Equal Interval) from Polygon (GeoJSON)", async ({ eq }) => {
  const georaster = await load(url);
  const results = histogram(georaster, polygonGeojson, ratioEIOptions)[0];
  Object.keys(ratioEIPolygonResults).forEach(key => {
    const value = results[key];
    const expectedValue = ratioEIPolygonResults[key];
    eq(value, expectedValue);
  });
});

// MODERN
test("(Modern) Get Histogram (Ratio, Equal Interval) from GeoRaster", async ({ eq }) => {
  const results = await histogram(urlSmallRaster, null, ratioEIOptions);
  Object.keys(ratioEIGeorasterResults).forEach(key => {
    const value = results[0][key];
    const expectedValue = ratioEIGeorasterResults[key];
    eq(value, expectedValue);
  });
});

test("(Modern) Get Histogram (Ratio, Quantile) from Bounding Box", async ({ eq }) => {
  const results = await histogram(url, bbox, ratioQuantileOptions);
  Object.keys(ratioQuantileBboxResults).forEach(key => {
    const value = results[0][key];
    const expectedValue = ratioQuantileBboxResults[key];
    eq(value, expectedValue);
  });
});

test("(Modern) Get Histogram (Ratio, Quantile) from Polygon", async ({ eq }) => {
  const results = await histogram(url, polygon, ratioQuantileOptions);
  Object.keys(ratioQuantilePolygonResults).forEach(key => {
    const value = results[0][key];
    const expectedValue = ratioQuantilePolygonResults[key];
    eq(value, expectedValue);
  });
});

test("(Modern) Get Histogram (Ratio, Equal Interval) from Polygon (GeoJSON)", async ({ eq }) => {
  const results = await histogram(url, polygonGeojson, ratioEIOptions);
  Object.keys(ratioEIPolygonResults).forEach(key => {
    const value = results[0][key];
    const expectedValue = ratioEIPolygonResults[key];
    eq(value, expectedValue);
  });
});
