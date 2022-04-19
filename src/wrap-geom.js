import reprojectBoundingBox from "reproject-bbox";
import reprojectGeoJSON from "reproject-geojson";

// this function allows the user to pass in { geom, srs }
// instead of geometry
export default function wrapGeom(func) {
  return (georaster, geom, ...rest) => {
    if (!Array.isArray(geom) && geom !== null && typeof geom === "object" && "srs" in geom && "geometry" in geom) {
      if (geom.srs !== georaster.projection) {
        const { geometry, srs } = geom;
        if (Array.isArray(geometry) && geometry.length === 4 && geometry.every(n => typeof n === "number")) {
          geom = reprojectBoundingBox({ bbox: geometry, from: srs, to: georaster.projection });
        } else {
          geom = reprojectGeoJSON(geometry, { from: srs, to: georaster.projection });
        }
      }
    }
    return func(georaster, geom, ...rest);
  };  
}