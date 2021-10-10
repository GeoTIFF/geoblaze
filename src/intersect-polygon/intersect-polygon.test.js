import test from "flug";
import { serve } from "srvd";
import fetch from "cross-fetch";
import get from "../get";
import load from "../load";
import parse from "../parse";
import utils from "../utils";
import convertGeometry from "../convert-geometry";
import intersectPolygon from "../intersect-polygon";
import bboxPolygon from "@turf/bbox-polygon";

serve({ debug: true, max: 4, port: 3000 });

const urlToGeojson = "http://localhost:3000/data/gadm/geojsons/Akrotiri and Dhekelia.geojson";

const urlToData = "http://localhost:3000/data/";

const url = urlToData + "test.tiff";

test("(Legacy) Testing intersection of box", async ({ eq }) => {
  const georaster = await load(url);
  const values = await get(georaster);

  let expectedNumberOfIntersectingPixels = 0;
  values.forEach(band => {
    band.forEach(row => {
      row.forEach(value => {
        if (value != georaster.noDataValue) {
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
  const coordinates = utils.getGeojsonCoors(geom);
  let numberOfIntersectingPixels = 0;
  intersectPolygon(georaster, coordinates, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, expectedNumberOfIntersectingPixels);
});

test("(Legacy) Test intersection/sum calculations for Country with Multiple Rings", async ({ eq }) => {
  const georaster = await load(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif");
  const response = await fetch(urlToGeojson);
  const country = await response.json();
  let numberOfIntersectingPixels = 0;
  const geom = convertGeometry("polygon", country);
  intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, 281);
});

// MODERN

test("(Modern) Testing intersection of box", async ({ eq }) => {
  const georaster = await parse(url);
  const values = await get(georaster);

  let expectedNumberOfIntersectingPixels = 0;
  values.forEach(band => {
    band.forEach(row => {
      row.forEach(value => {
        if (value != georaster.noDataValue) {
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
  const coordinates = utils.getGeojsonCoors(geom);
  let numberOfIntersectingPixels = 0;
  await intersectPolygon(georaster, coordinates, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, expectedNumberOfIntersectingPixels);
});

test("(Modern) Test intersection/sum calculations for Country with Multiple Rings", async ({ eq }) => {
  const georaster = await parse(urlToData + "ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif");
  const response = await fetch(urlToGeojson);
  const country = await response.json();
  let numberOfIntersectingPixels = 0;
  const geom = convertGeometry("polygon", country);
  await intersectPolygon(georaster, geom, () => numberOfIntersectingPixels++);
  eq(numberOfIntersectingPixels, 281);
});
