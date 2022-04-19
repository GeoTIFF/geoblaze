import convertGeometry from "../convert-geometry";
import wrap from "../wrap-parse";

const identify = (georaster, geometry) => {
  // The convertGeometry function takes the input
  // geometry and converts it to a standard format.
  const [xInCrs, yInCrs] = convertGeometry("point", geometry);

  // By normalizing the difference in latitude and longitude between the image
  // origin and the point geometry by the cell height and width respectively,
  // we can map the latitude and longitude of the point geometry in the
  // coordinate space to their associated pixel location in the image space.
  // Note that the y value is inverted to account for the inversion between the
  // coordinate and image spaces.
  const x = Math.floor((xInCrs - georaster.xmin) / georaster.pixelWidth);
  const y = Math.floor((georaster.ymax - yInCrs) / georaster.pixelHeight);

  try {
    // iterate through the bands
    // get the row and then the column of the pixel that you want
    if (x > 0 && x < georaster.width && y > 0 && y < georaster.height) {
      if (georaster.values) {
        // loaded completely into memory
        return georaster.values.map(rows => rows[y][x]);
      } else {
        return georaster.getValues({ height: 1, width: 1, left: x, top: y, right: x + 1, bottom: y + 1 }).then(bands => bands.map(band => band[0][0]));
      }
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default wrap(identify);
