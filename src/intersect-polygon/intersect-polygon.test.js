import test from "flug";
import fetch from "cross-fetch";
import { serve } from "srvd";
import parseGeoraster from "georaster";
import bboxPolygon from "@turf/bbox-polygon";
import reprojectGeoJSON from "reproject-geojson";

import get from "../get";
import load from "../load";
import parse from "../parse";
import { convertMultiPolygon } from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";

async function countIntersectingPixels(georaster, geom, includeNoData, { debug_level, vrm } = {}) {
  let numberOfIntersectingPixels = 0;
  const result = await intersectPolygon(
    georaster,
    geom,
    value => {
      if (includeNoData || value !== georaster.noDataValue) {
        numberOfIntersectingPixels++;
      }
    },
    { debug_level, vrm }
  );
  return { numberOfIntersectingPixels, ...result };
}

async function fetch_json(url) {
  let res;
  let text;
  try {
    res = await fetch(url);
    text = await res.text();
    return JSON.parse(text);
  } catch (error) {
    console.log("text:", text);
    throw error;
  }
}

serve({ debug: true, max: 30, port: 3000, wait: 60 });

const urlToGeojson = "http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson";

const urlToData = "http://localhost:3000/data/";

const url = urlToData + "test.tiff";

const EXPECTED_NUMBER_OF_INTERSECTING_PIXELS = 229; // same as rasterstats

test("(Legacy) Testing intersection of box", async ({ eq }) => {
  const georaster = await load(url);
  const values = await get(georaster);

  let expectedNumberOfIntersectingPixels = 0;
  values.forEach(band => {
    band.forEach(row => {
      row.forEach(value => {
        if (value !== georaster.noDataValue) {
          expectedNumberOfIntersectingPixels++;
        }
      });
    });
  });

  const pixelHeight = georaster.pixelHeight;
  const pixelWidth = georaster.pixelWidth;

  // minX, minY, maxX, maxY
  const geom = bboxPolygon([
    georaster.xmin + 0.5 * pixelWidth,
    georaster.ymin + 0.5 * pixelHeight,
    georaster.xmax - 0.5 * pixelWidth,
    georaster.ymax - 0.5 * pixelHeight
  ]);
  const coords = geom.geometry.coordinates;
  const { numberOfIntersectingPixels } = await countIntersectingPixels(georaster, coords, false);
  eq(numberOfIntersectingPixels, expectedNumberOfIntersectingPixels);
});

test("(Legacy) Test intersection/sum calculations for Country with Multiple Rings", async ({ eq }) => {
  const georaster = await load(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif");
  const response = await fetch(urlToGeojson);
  const country = await response.json();
  const geom = convertMultiPolygon(country);
  const { numberOfIntersectingPixels } = await countIntersectingPixels(georaster, geom, true);
  eq(numberOfIntersectingPixels, EXPECTED_NUMBER_OF_INTERSECTING_PIXELS);
});

// MODERN

test("(Modern) Testing intersection of box", async ({ eq }) => {
  const georaster = await parse(url);
  const values = await get(georaster);

  let expectedNumberOfIntersectingPixels = 0;
  values.forEach(band => {
    band.forEach(row => {
      row.forEach(value => {
        expectedNumberOfIntersectingPixels++;
      });
    });
  });

  const pixelHeight = georaster.pixelHeight;
  const pixelWidth = georaster.pixelWidth;

  // minX, minY, maxX, maxY
  const geom = bboxPolygon([
    georaster.xmin + 0.5 * pixelWidth,
    georaster.ymin + 0.5 * pixelHeight,
    georaster.xmax - 0.5 * pixelWidth,
    georaster.ymax - 0.5 * pixelHeight
  ]);
  const coords = geom.geometry.coordinates;
  let numberOfIntersectingPixels = 0;
  await intersectPolygon(georaster, coords, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, expectedNumberOfIntersectingPixels);
});

test("(Modern) Test intersection/sum calculations for Country with Multiple Rings", async ({ eq }) => {
  const georaster = await parse(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif");
  const response = await fetch(urlToGeojson);
  const country = await response.json();
  let numberOfIntersectingPixels = 0;
  const geom = convertMultiPolygon(country);
  await intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, EXPECTED_NUMBER_OF_INTERSECTING_PIXELS);
});

test("Hole Test", async ({ eq }) => {
  const georaster = await parseGeoraster(
    [
      [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1]
      ]
    ],
    {
      noDataValue: 0,
      projection: 4326,
      xmin: 0, // left
      ymax: 20, // top
      pixelWidth: 5,
      pixelHeight: 5
    }
  );
  const url = urlToData + "holes/hole-2.geojson";
  const geojson = await fetch(url).then(res => res.json());

  let numberOfIntersectingPixels = 0;
  const geom = convertMultiPolygon(geojson);
  await intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, 12);
});

test("antimerdian #1", async ({ eq }) => {
  const georaster = await parse(urlToData + "gfwfiji_6933_COG.tiff");
  let geojson = await fetch_json(urlToData + "antimeridian/right-edge.geojson");
  let numberOfIntersectingPixels = 0;
  // reproject geometry to projection of raster
  geojson = reprojectGeoJSON(geojson, { from: 4326, to: georaster.projection });
  const geom = convertMultiPolygon(geojson);
  await intersectPolygon(georaster, geom, value => {
    if (value !== georaster.noDataValue) {
      numberOfIntersectingPixels++;
    }
  });
  // rasterstats says 314,930
  eq(numberOfIntersectingPixels, 314_930);
});

test("antimerdian #1, vrm=10", async ({ eq }) => {
  const georaster = await parse(urlToData + "gfwfiji_6933_COG.tiff");
  let geojson = await fetch_json(urlToData + "antimeridian/right-edge.geojson");
  let numberOfIntersectingPixels = 0;
  // reproject geometry to projection of raster
  geojson = reprojectGeoJSON(geojson, { from: 4326, to: georaster.projection });
  const geom = convertMultiPolygon(geojson);
  await intersectPolygon(
    georaster,
    geom,
    value => {
      if (value !== georaster.noDataValue) {
        numberOfIntersectingPixels++;
      }
    },
    { vrm: 10 }
  );
  eq(numberOfIntersectingPixels, 31_501_375);
});

test("parse", async ({ eq }) => {
  const georaster = await parse(urlToData + "geotiff-test-data/gfw-azores.tif");
  const geojson = await fetch_json(urlToData + "santa-maria/santa-maria-mpa.geojson");
  const geom = convertMultiPolygon(geojson);
  const values = [];
  await intersectPolygon(georaster, geom, (value, iband, irow, icol) => {
    values.push(value);
  });
  eq(values, [19.24805450439453, 9.936111450195312]);
});

test("parse no overlap", async ({ eq }) => {
  const georaster = await parse(urlToData + "geotiff-test-data/gfw-azores.tif");
  const geojson = await fetch_json(urlToData + "santa-maria/santa-maria-mpa-offset.geojson");
  let numberOfIntersectingPixels = 0;
  const geom = convertMultiPolygon(geojson);
  await intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
  // same as rasterstats
  eq(numberOfIntersectingPixels, 0);
});

test("more testing", async ({ eq }) => {
  const georaster = await parse(urlToData + "test.tiff");
  const geojson = await fetch_json(urlToData + "part-of-india.geojson");
  const geom = convertMultiPolygon(geojson);
  const { numberOfIntersectingPixels } = await countIntersectingPixels(georaster, geom, false);
  // same as rasterstats
  eq(numberOfIntersectingPixels, 1_672);
});

test("virtual resampling with vrm = minimal", async ({ eq }) => {
  const georaster = await parse(urlToData + "/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif");
  const geojson = await fetch_json(urlToData + "/virtual-resampling/virtual-resampling-one.geojson");
  const geom = convertMultiPolygon(geojson);
  const { numberOfIntersectingPixels, vrm } = await countIntersectingPixels(georaster, geom, false, { debug_level: 0, vrm: "minimal" });
  eq(vrm, [12, 21]);
  eq(numberOfIntersectingPixels, 2);
});

test("virtual resampling with vrm = 100", async ({ eq }) => {
  const georaster = await parse(urlToData + "/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif");
  const geojson = await fetch_json(urlToData + "/virtual-resampling/virtual-resampling-one.geojson");
  const geom = convertMultiPolygon(geojson);
  const { numberOfIntersectingPixels, vrm } = await countIntersectingPixels(georaster, geom, false, { debug_level: 0, vrm: 100 });
  eq(vrm, [100, 100]);
  eq(numberOfIntersectingPixels, 104);
});

test("virtual resampling intersect with vrm = minimal", async ({ eq }) => {
  const georaster = await parse(urlToData + "/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif");
  const geojson = await fetch_json(urlToData + "/virtual-resampling/virtual-resampling-intersect.geojson");
  const geom = convertMultiPolygon(geojson);
  const { numberOfIntersectingPixels, vrm } = await countIntersectingPixels(georaster, geom, false, { debug_level: 0, vrm: "minimal" });
  eq(vrm, [4, 4]);
  eq(numberOfIntersectingPixels, 2);
});

test("virtual resampling intersect with vrm = 100", async ({ eq }) => {
  const georaster = await parse(urlToData + "/geotiff-test-data/nz_habitat_anticross_4326_1deg.tif");
  const geojson = await fetch_json(urlToData + "/virtual-resampling/virtual-resampling-intersect.geojson");
  const geom = convertMultiPolygon(geojson);
  const { numberOfIntersectingPixels, vrm } = await countIntersectingPixels(georaster, geom, false, { debug_level: 0, vrm: 100 });
  eq(vrm, [100, 100]);
  eq(numberOfIntersectingPixels, 1577);
});
