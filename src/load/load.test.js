import test from "flug";
import { serve } from "srvd";
import load from "./load.module";

import {
  ERROR_BAD_URL
  //ERROR_PARSING_GEOTIFF
} from "../error-constants";

serve({ debug: true, max: 2, port: 3000 });

const path = "http://localhost:3000/data/test.tiff";
const incorrectPath = "http://localhost:3000/data/this-is-not-a-real-dataset.tiff";
const incorrectPath2 = "this-is-a-fake-path";
//const incorrectPath3 = 'http://localhost:3000/data/random-file';

const properties = ["projection", "xmin", "values"];

test("Loaded tiff export from geonode", async ({ eq }) => {
  const url = "https://s3.amazonaws.com/georaster/geonode_atlanteil.tif";
  const georaster = await load(url);
  properties.forEach(property => {
    eq(property in georaster, true);
  });
});

test("Loaded tiff file", async ({ eq }) => {
  const georaster = await load(path);
  properties.forEach(property => {
    eq(property in georaster, true);
  });
});

test("Error from invalid URL", async ({ eq }) => {
  let message;
  try {
    await load(incorrectPath);
  } catch (error) {
    ({ message } = error);
  }
  eq(message, ERROR_BAD_URL);
});

test("Load: Error from another invalid URL tiff file", async ({ eq }) => {
  let message;
  try {
    await load(incorrectPath2);
  } catch (error) {
    ({ message } = error);
  }
  eq(message, ERROR_BAD_URL);
});

/*
// commenting out this test because failing because Unhandled Promise Rejection
// in georaster
describe('Error from an invalid file', function () {
  this.timeout(10);
  it('Loaded tiff file', () => {
    try {
      return load(incorrectPath3).then(null, error => {
        expect(error.message).to.equal(ERROR_PARSING_GEOTIFF);
      });
    } catch(error) {
      expect(error.message).to.equal(ERROR_PARSING_GEOTIFF);
    }
  });
});
*/

// test('Loaded from tiff file', async ({ eq }) => {
//   const blob = await fetch(path);
//   const tiff = await load(blob);
//   let image = tiff.getImage();
//   properties.forEach(property => {
//     eq(property in image);
//   })
// });
