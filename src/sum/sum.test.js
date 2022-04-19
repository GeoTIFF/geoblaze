import test from "flug";
import { serve } from "srvd";

import utils from "../utils";
import load from "../load";
import parse from "../parse";
import sum from "./sum.module";
import turfBbox from "@turf/bbox";
import { polygon as turfPolygon } from "@turf/helpers";

const { fetchJson, fetchJsons } = utils;

const { port } = serve({ debug: true, max: 100, port: 8888, wait: 120 });

const urlRwanda = `http://localhost:${port}/data/RWA_MNH_ANC.tif`;
const bboxRwanda = require("../../data/RwandaBufferedBoundingBox.json");

const urlToData = `http://localhost:${port}/data/`;
const urlToGeojsons = urlToData + "gadm/geojsons/";
const urlToArcgisJsons = urlToData + "gadm/arcgis/";

const url = `http://localhost:${port}/data/test.tiff`;
const bbox = [80.63, 7.42, 84.21, 10.1];
const expectedBboxValue = 262516.5;

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
const expectedPolygonValue = 3125542.2;

const polygonGeojson1 = `{
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        86.220703125,
        22.156883186860703
      ],
      [
        86.341552734375,
        21.43261686447735
      ],
      [
        86.912841796875,
        21.70847301324597
      ],
      [
        87.000732421875,
        22.39071391683855
      ],
      [
        85.968017578125,
        22.49225722008518
      ],
      [
        85.726318359375,
        21.912470952680266
      ],
      [
        86.220703125,
        22.156883186860703
      ]
      ]
    ]
    }
  }]
}`;

const expectedPolygonGeojsonValue1 = 292256.3;

const polygonGeojson2 = `{
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        85.869140625,
        20.64306554672647
      ],
      [
        86.12182617187499,
        21.022982546427425
      ],
      [
        85.330810546875,
        21.361013117950915
      ],
      [
        84.44091796875,
        21.3303150734318
      ],
      [
        85.594482421875,
        21.074248926792812
      ],
      [
        85.067138671875,
        20.715015145512087
      ],
      [
        85.869140625,
        20.64306554672647
      ]
      ]
    ]
    }
  }]
}`;

const expectedPolygonGeojsonValue2 = 137973.3;

const polygonGeojsonCollection = `{
  "type": "FeatureCollection",
  "features": [
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        86.220703125,
        22.156883186860703
      ],
      [
        86.341552734375,
        21.43261686447735
      ],
      [
        86.912841796875,
        21.70847301324597
      ],
      [
        87.000732421875,
        22.39071391683855
      ],
      [
        85.968017578125,
        22.49225722008518
      ],
      [
        85.726318359375,
        21.912470952680266
      ],
      [
        86.220703125,
        22.156883186860703
      ]
      ]
    ]
    }
  },
  {
    "type": "Feature",
    "properties": {},
    "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
      [
        85.869140625,
        20.64306554672647
      ],
      [
        86.12182617187499,
        21.022982546427425
      ],
      [
        85.330810546875,
        21.361013117950915
      ],
      [
        84.44091796875,
        21.3303150734318
      ],
      [
        85.594482421875,
        21.074248926792812
      ],
      [
        85.067138671875,
        20.715015145512087
      ],
      [
        85.869140625,
        20.64306554672647
      ]
      ]
    ]
    }
  }
  ]
}`;

const expectedPolygonGeojsonCollectionValue = expectedPolygonGeojsonValue1 + expectedPolygonGeojsonValue2;

test("(Legacy) Get Sum from Veneto Geonode", async ({ eq }) => {
  const values = [
    await load(`http://localhost:${port}/data/veneto/geonode_atlanteil.tif`),
    await fetchJson(`http://localhost:${port}/data/veneto/veneto.geojson`)
  ];
  const [georaster, geojson] = values;
  const results = sum(georaster, geojson);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 25057.69;
  eq(actualValue, expectedValue);
});

test("(Legacy) Get Sum", async ({ eq }) => {
  const georaster = await load(url);
  const results = sum(georaster);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 108343045.4;
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
  eq(value, 1453380.1);
});

// test getting correct populations for countries
const countries = [
  { population: 790242.0, name: "Cyprus" },
  { population: 5066313.5, name: "Nicaragua" },
  { population: 5554059.5, name: "Lebanon" },
  { population: 2332581.75, name: "Jamaica" },
  { population: 4685367.5, name: "Croatia" },
  { population: 2234089.5, name: "Macedonia" },
  { population: 3303561.5, name: "Uruguay" }
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
  const expectedValue = 25057.69;
  eq(actualValue, expectedValue);
});

test("(Modern) Get Sum", async ({ eq }) => {
  const georaster = await parse(url);
  const results = await sum(georaster);
  const actualValue = Number(results[0].toFixed(2));
  const expectedValue = 108343045.4;
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
  eq(value, 1453380.1);
});
