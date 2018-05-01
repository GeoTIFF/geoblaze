import load from 'load';
import convertGeometry from 'convert-geometry';

const identify = (georaster, geometry) => {

  // The convertGeometry function takes the input
  // geometry and converts it to a standard format.
  let point = convertGeometry('point', geometry);
  let xInCrs = point[0];
  let yInCrs = point[1];


  // By normalizing the difference in latitude and longitude between the image
  // origin and the point geometry by the cell height and width respectively,
  // we can map the latitude and longitude of the point geometry in the
  // coordinate space to their associated pixel location in the image space.
  // Note that the y value is inverted to account for the inversion between the
  // coordinate and image spaces.
  let x = Math.floor((xInCrs - georaster.xmin) / georaster.pixelWidth);
  let y = Math.floor((georaster.ymax - yInCrs) / georaster.pixelHeight);

  try {

    // iterate through the bands
    // get the row and then the column of the pixel that you want
    if (x > 0 && x < georaster.width && y > 0 && y < georaster.height) {
      return georaster.values.map(rows => rows[y][x]);
    } else {
      return null;
    }

  } catch(e) {
    throw e;
  }
}

export default identify;
