import load from "./load";

// this function basically allows you to pass a URL into a geoblaze function
// and let geoblaze load the whole GeoRaster for you
export default function wrap(func) {
  return (georaster, ...rest) => {
    if (typeof georaster === "string") {
      return load(georaster).then(georaster => func(georaster, ...rest));
    } else {
      return func(georaster, ...rest);
    }
  };
}
