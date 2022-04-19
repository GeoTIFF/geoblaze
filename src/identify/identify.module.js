import wrapParse from "../wrap-parse";
import wrapGeom from "../wrap-geom";
import identifyCore from "./identify.core";

export default function identify(...rest) {
  return wrapParse(wrapGeom(identifyCore))(...rest);
}
