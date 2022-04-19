import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import medianCore from "./median.core";

export default function median(...rest) {
  return wrapParse(wrapGeom(medianCore))(...rest);
}