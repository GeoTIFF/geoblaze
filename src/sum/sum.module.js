import stats from "../stats";
import utils from "../utils";

export default function sum(georaster, geometry, test) {
  return utils.resolve(stats(georaster, geometry, { calcSum: true }, test)).then(stats => stats.map(({ sum }) => sum));
}
