import stat from "./stat";

export default function modes(georaster, geometry, test) {
  return stat(georaster, geometry, "modes", test);
}
