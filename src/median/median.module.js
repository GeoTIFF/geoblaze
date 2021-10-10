import stats from "../stats";
import utils from "../utils";

export default function median(georaster, geometry) {
  return utils.resolve(stats(georaster, geometry, { calcMedian: true })).then(stats => stats.map(({ median }) => median));
}
