import { readFileSync } from "fs";
import fetch from "cross-fetch";
import test from "flug";
import { serve } from "srvd";
import turfBbox from "@turf/bbox";
import { polygon as turfPolygon } from "@turf/helpers";
import reprojectGeoJSON from "reproject-geojson";

import utils from "../utils";
import load from "../load";
import parse from "../parse";
import sum from ".";

const { fetchJson, fetchJsons } = utils;

const { port } = serve({ debug: true, max: 31, port: 8888, wait: 120 });

const urlRwanda = `http://localhost:${port}/data/RWA_MNH_ANC.tif`;
const bboxRwanda = require("../../data/RwandaBufferedBoundingBox.json");

const urlToData = `http://localhost:${port}/data/`;
const urlToGeojsons = urlToData + "gadm/geojsons/";
const urlToArcgisJsons = urlToData + "gadm/arcgis/";

const url = `http://localhost:${port}/data/test.tiff`;
const bbox = [80.63, 7.42, 84.21, 10.1];

// import rasterio
// from rasterio.windows import from_bounds
// with rasterio.open("./data/test.tiff") as src:
//   arr = src.read(1, window=from_bounds(80.63, 7.42, 84.21, 10.1, src.transform))
//   arr[arr > 0].sum()
// 236_435.40000000002
const expectedBboxValue = 236_435.4;

const polygon = JSON.parse(readFileSync("./data/part-of-india.geojson", "utf-8"));

const expectedPolygonValue = 3_099_403.8; // same as rasterstats

const polygonGeojson1 = JSON.parse(readFileSync("./data/part-of-india-2.geojson", "utf-8"));

const expectedPolygonGeojsonValue1 = 291_490.5; // same as rasterstats

const polygonGeojson2 = JSON.parse(readFileSync("./data/part-of-india-3.geojson", "utf-8"));

const expectedPolygonGeojsonValue2 = 129_465.7; // same as rasterstats

const polygonGeojsonCollection = {
  type: "FeatureCollection",
  features: [polygonGeojson1, polygonGeojson2]
};

const expectedPolygonGeojsonCollectionValue = expectedPolygonGeojsonValue1 + expectedPolygonGeojsonValue2;

test("(Legacy) Get Sum from Veneto Geonode", async ({ eq }) => {
  const values = [
    await load(`http://localhost:${port}/data/veneto/geonode_atlanteil.tif`),
    await fetchJson(`http://localhost:${port}/data/veneto/veneto.geojson`)
  ];
  const [georaster, geojson] = values;
  const results = sum(georaster, geojson);
  eq(Array.isArray(results), true);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 24_943.31; // rasterstats says 24,963.465454101562
  eq(actualValue, expectedValue);
});

test("(Legacy) Get Sum", async ({ eq }) => {
  const georaster = await load(url);
  const results = sum(georaster);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 108_343_045.4; // rasterio says 108,343,045.40000004
  eq(actualValue, expectedValue);
});

test("(Legacy) Get Sum from Bounding Box", async ({ eq }) => {
  const georaster = await load(url);
  const results = sum(georaster, bbox);
  const value = Number(results[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("(Legacy) Get Sum from Bounding Box Greater Then Raster", async ({ eq }) => {
  const georaster = await load(urlRwanda);
  const results = sum(georaster, bboxRwanda);
  const valueWithBufferedBbox = Number(results[0].toFixed(2));
  const valueWithoutBbox = Number(sum(georaster)[0].toFixed(2));
  eq(valueWithBufferedBbox, 104848.45);
  eq(valueWithoutBbox, 104848.45);
  eq(valueWithBufferedBbox, valueWithoutBbox);
});

test("(Legacy) Get Same Sum from GeoJSON and ESRI JSON", async ({ eq }) => {
  const urlToRaster = urlToData + "mapspam/spam2005v3r2_harvested-area_wheat_total.tiff";
  const georaster = await load(urlToRaster);
  const countryNames = ["Afghanistan", "Ukraine"];
  for (let i = 0; i < countryNames.length; i++) {
    const name = countryNames[i];
    const jsons = await fetchJsons([urlToGeojsons + name + ".geojson", urlToArcgisJsons + name + ".json"], true);
    const [geojson, arcgisJson] = jsons;
    const valueViaGeojson = Number(sum(georaster, geojson)[0].toFixed(2));
    const valueViaArcgisJson = Number(sum(georaster, arcgisJson)[0].toFixed(2));
    const valueViaArcgisJsonPolygon = Number(sum(georaster, arcgisJson.geometry)[0].toFixed(2));
    eq(valueViaGeojson, valueViaArcgisJson);
    eq(valueViaGeojson, valueViaArcgisJsonPolygon);
  }
});

test("(Legacy) Get Sum from Polygon", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygon)[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test("(Legacy) Get Sum from Polygon (GeoJSON) 1", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygonGeojson1)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonValue1);
});

test("(Legacy) Get Sum from Polygon (GeoJSON) 2", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygonGeojson2)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonValue2);
});

test("(Legacy) Get Sum from Polygon (Multi-Polygon GeoJSON, 1 + 2)", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygonGeojsonCollection)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonCollectionValue);
});

test("(Legacy) Test sum for Country with Multiple Rings", async ({ eq }) => {
  const georaster = await load(url);
  const country = await utils.fetchJson(urlToGeojsons + "Akrotiri and Dhekelia.geojson");
  const result = sum(georaster, country);
  eq(result, [0]);
});

test("(Legacy) Get Sum from Polygon Above X Value", async ({ eq }) => {
  const georaster = await load(url);
  const value = Number(sum(georaster, polygon, v => v > 3000)[0].toFixed(2));
  eq(value, 1_454_066);
});

// test getting correct populations for countries
const countries = [
  { population: 790_242.0, name: "Cyprus" }, // rasterstats says 790,242.0625
  { population: 5_066_313.5, name: "Nicaragua" }, // same as rasterstats
  { population: 5_554_059.5, name: "Lebanon" }, // rasterstats says 5,554,060.0
  { population: 2_332_581.75, name: "Jamaica" }, // same as rasterstats
  { population: 4_685_367.5, name: "Croatia" }, // rasterstats says 4,685,367.0
  { population: 2_234_089.5, name: "Macedonia" }, // rasterstats says 2,239,499.25
  { population: 3_303_561.5, name: "Uruguay" } // rasterstats says 3,303,090.0
];
for (let i = 0; i < countries.length; i++) {
  const { population, name } = countries[i];
  test("(Sum) Population for " + name, async ({ eq }) => {
    const countryGeojson = await fetchJson(urlToGeojsons + name + ".geojson");
    const countryBbox = turfBbox(countryGeojson);
    const [minX, minY, maxX, maxY] = countryBbox;
    const left = Math.round((minX - 5) / 10) * 10;
    const right = Math.round((maxX - 5) / 10) * 10;
    const _bottom = 90 - 10 * Math.floor((90 - minY) / 10);
    const _top = 90 - 10 * Math.floor((90 - maxY) / 10);

    const latitudes = utils.range(_top, _bottom - 1, -10);
    const longitudes = utils.range(left, right + 1, 10);
    const tiles = [];
    latitudes.forEach(latitude => {
      longitudes.forEach(longitude => {
        tiles.push(load(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_" + longitude + "_" + latitude + ".tif"));
      });
    });

    // wait for all georaster tiles to load
    const georasters = await Promise.all(tiles);

    let totalSum = 0;
    if (countryGeojson.geometry.type === "MultiPolygon") {
      countryGeojson.geometry.coordinates.map(polygon => {
        georasters.forEach(georaster => {
          try {
            let partialSum = sum(georaster, turfPolygon(polygon));
            if (Array.isArray(partialSum)) partialSum = partialSum[0];
            if (partialSum > 0) {
              totalSum += partialSum;
            }
          } catch (error) {
            // pass
          }
        });
      });
    } else if (countryGeojson.geometry.type === "Polygon") {
      georasters.forEach(georaster => {
        try {
          let partialSum = sum(georaster, countryGeojson);
          if (Array.isArray(partialSum)) partialSum = partialSum[0];
          if (partialSum > 0) {
            totalSum += partialSum;
          }
        } catch (error) {
          // pass
        }
      });
    }
    const percentOff = Math.abs(population - totalSum) / population;
    eq(percentOff < 0.05, true);
  });
}

// modern

test("(Modern) Get Sum from Veneto Geonode", async ({ eq }) => {
  const values = [
    await load(`http://localhost:${port}/data/veneto/geonode_atlanteil.tif`),
    await fetchJson(`http://localhost:${port}/data/veneto/veneto.geojson`)
  ];
  const [georaster, geojson] = values;
  const results = await sum(georaster, geojson);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 24_943.31; // rasterstats says 24,963.465454101562
  eq(actualValue, expectedValue);
});

test("(Modern) Get Sum", async ({ eq }) => {
  const georaster = await parse(url);
  const results = await sum(georaster);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 108_343_045.4; // rasterstats says 108_343_045.40000004
  eq(actualValue, expectedValue);
});

test("(Modern) Get Sum from Bounding Box", async ({ eq }) => {
  const georaster = await parse(url);
  const results = await sum(georaster, bbox);
  const value = Number(results[0].toFixed(2));
  eq(value, expectedBboxValue);
});

test("(Modern) Get Sum from Bounding Box Greater Then Raster", async ({ eq }) => {
  const georaster = await parse(urlRwanda);
  const results = await sum(georaster, bboxRwanda);
  const valueWithBufferedBbox = Number(results[0].toFixed(2));
  const valueWithoutBbox = Number(sum(georaster)[0].toFixed(2));
  eq(valueWithBufferedBbox, 104848.45);
  eq(valueWithoutBbox, 104848.45);
  eq(valueWithBufferedBbox, valueWithoutBbox);
});

test("(Modern) Get Same Sum from GeoJSON and ESRI JSON", async ({ eq }) => {
  const urlToRaster = urlToData + "mapspam/spam2005v3r2_harvested-area_wheat_total.tiff";
  const georaster = await parse(urlToRaster);
  const countryNames = [
    ["Afghanistan", 2_226_323.1], // rasterstats says 2,227,296
    ["Ukraine", 5_875_383.4] // rasterstats says 5,877,552
  ];
  for (let i = 0; i < countryNames.length; i++) {
    const [name, expectedSum] = countryNames[i];
    const jsons = await fetchJsons([urlToGeojsons + name + ".geojson", urlToArcgisJsons + name + ".json"], true);
    const [geojson, arcgisJson] = jsons;
    const valueViaGeojson = Number((await sum(georaster, geojson))[0].toFixed(2));
    eq(valueViaGeojson, expectedSum);

    const valueViaArcgisJson = Number((await sum(georaster, arcgisJson))[0].toFixed(2));
    eq(valueViaArcgisJson, expectedSum);

    const valueViaArcgisJsonPolygon = Number((await sum(georaster, arcgisJson.geometry))[0].toFixed(2));
    eq(valueViaArcgisJsonPolygon, expectedSum);
  }
});

test("(Modern) Get Sum from Polygon", async ({ eq }) => {
  const georaster = await parse(url);
  const value = Number(sum(georaster, polygon)[0].toFixed(2));
  eq(value, expectedPolygonValue);
});

test("(Modern) Get Sum from Polygon (GeoJSON) 1", async ({ eq }) => {
  const georaster = await parse(url);
  const value = Number(sum(georaster, polygonGeojson1)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonValue1);
});

test("(Modern) Get Sum from Polygon (GeoJSON) 2", async ({ eq }) => {
  const georaster = await parse(url);
  const value = Number(sum(georaster, polygonGeojson2)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonValue2);
});

test("(Modern) Get Sum from Polygon (Multi-Polygon GeoJSON, 1 + 2)", async ({ eq }) => {
  const georaster = await parse(url);
  const value = Number(sum(georaster, polygonGeojsonCollection)[0].toFixed(2));
  eq(value, expectedPolygonGeojsonCollectionValue);
});

test("(Modern) Test sum for Country with Multiple Rings", async ({ eq }) => {
  const georaster = await parse(url);
  const country = await utils.fetchJson(urlToGeojsons + "Akrotiri and Dhekelia.geojson");
  const result = await sum(georaster, country);
  eq(result, [0]);
});

test("(Modern) Get Sum from Polygon Above X Value", async ({ eq }) => {
  const georaster = await parse(url);
  const value = Number(sum(georaster, polygon, v => v > 3000)[0].toFixed(2));
  eq(value, 1_454_066);
});

test("Virtual Resampling", async ({ eq }) => {
  const values = [
    await load(`http://localhost:${port}/data/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif`),
    await fetchJson(`http://localhost:${port}/data/virtual-resampling/virtual-resampling-one.geojson`)
  ];
  const [georaster, geojson] = values;

  let msg;
  try {
    await sum(georaster, geojson, undefined);
  } catch (error) {
    msg = error.toString();
  }
  eq(msg, "No Values were found in the given geometry");

  const results_minimal = await sum(georaster, geojson, undefined, { vrm: "minimal", rescale: true });
  eq(results_minimal, [0.30158730158730157]);

  const results_100 = await sum(georaster, geojson, undefined, { vrm: [100, 100], rescale: true });
  eq(results_100, [0.3952]);

  const results_1000 = await sum(georaster, geojson, undefined, { vrm: [10_000, 10_000], rescale: true });
  eq(results_1000, [0.41278374]);
});
