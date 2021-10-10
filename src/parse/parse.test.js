import findAndRead from "find-and-read";
import test from "flug";
import { serve } from "srvd";
import parse from "./index";

import {
  // ERROR_BAD_URL
  ERROR_PARSING_GEOTIFF
} from "../error-constants";

const path = "http://localhost:3000/data/test.tiff";
const incorrectPath = "http://localhost:3000/data/this-is-not-a-real-dataset.tiff";
const incorrectPath2 = "this-is-a-fake-path";
//const incorrectPath3 = 'http://localhost:3000/data/random-file';

const properties = [
  "projection",
  "xmin"
  // 'values'
];

serve({ debug: true, max: 4, port: 3000 });

test("Loaded geonode tiff export from url", async ({ eq }) => {
  const url = "https://s3.amazonaws.com/georaster/geonode_atlanteil.tif";
  const georaster = await parse(url, { logErrors: false });
  properties.forEach(property => {
    eq(property in georaster, true);
  });
});

test("Loaded geonode tiff export from buffer", async ({ eq }) => {
  const buffer = await findAndRead("geonode_atlanteil.tif");
  const georaster = await parse(buffer);
  properties.forEach(property => {
    eq(property in georaster, true);
  });
});

test("Loaded geonode tiff export from array buffer", async ({ eq }) => {
  const buffer = await findAndRead("geonode_atlanteil.tif");
  const arrayBuffer = buffer.buffer;
  const georaster = await parse(arrayBuffer);
  properties.forEach(property => {
    eq(property in georaster, true);
  });
});

test("Loaded tiff file", async ({ eq }) => {
  const georaster = await parse(path, { logErrors: false });
  properties.forEach(property => {
    eq(property in georaster, true);
  });
});

test("Error from invalid URL", async ({ eq }) => {
  let message;
  try {
    await parse(incorrectPath, { logErrors: false });
  } catch (error) {
    ({ message } = error);
  }
  eq(message, ERROR_PARSING_GEOTIFF);
});

test("Load: Error from another invalid URL tiff file", async ({ eq }) => {
  let message;
  try {
    await parse(incorrectPath2, { logErrors: false });
  } catch (error) {
    ({ message } = error);
  }
  eq(message, ERROR_PARSING_GEOTIFF);
});

/*
// commenting out this test because failing because Unhandled Promise Rejection
// in georaster
describe('Error from an invalid file', function () {
  this.timeout(10);
  it('Loaded tiff file', () => {
    try {
      return parse(incorrectPath3).then(null, error => {
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
//   const tiff = await parse(blob);
//   let image = tiff.getImage();
//   properties.forEach(property => {
//     eq(property in image);
//   })
// });
