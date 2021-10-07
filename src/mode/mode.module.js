/**
 * @prettier
 */
import stats from "../stats";
import utils from "../utils";

export default function mode(georaster, geometry) {
  return utils.resolve(stats(georaster, geometry, { calcMode: true })).then(stats => stats.map(({ mode }) => mode));
}
