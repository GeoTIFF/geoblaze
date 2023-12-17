import stat from "./stat";

export default function max(georaster, geometry, test) {
  return stat(georaster, geometry, "max", test);
}
