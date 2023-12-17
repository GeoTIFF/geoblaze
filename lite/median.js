import stat from "./stat";

export default function median(georaster, geometry, test) {
  return stat(georaster, geometry, "median", test);
}
