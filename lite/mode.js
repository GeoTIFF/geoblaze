import stat from "./stat";

export default function mode(georaster, geometry, test) {
  return stat(georaster, geometry, "mode", test);
}
