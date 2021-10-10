import parse from "./parse";

// this function basically allows you to pass a URL into a geoblaze function
// and let geoblaze parse the GeoRaster for you
export default function wrap(func) {
  return (georaster, ...rest) => {
    if (typeof georaster === "string") {
      return parse(georaster).then(georaster => func(georaster, ...rest));
    } else {
      return func(georaster, ...rest);
    }
  };
}
