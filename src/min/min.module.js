import wrapGeom from "../wrap-geom";
import wrapParse from "../wrap-parse";
import minCore from "./min.core";

export default function min(...rest) {
  return wrapParse(wrapGeom(minCore))(...rest);
}