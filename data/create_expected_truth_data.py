import csv
import os

import rasterio

from rasterstats import zonal_stats
from rasterstats.utils import VALID_STATS


# known limitations
# - just for first band
# - doesn't handle overlapping polygons

test_cases = [
  ["part-of-india.geojson", "test.tiff"],
  ["part-of-india-2.geojson", "test.tiff"],
  ["part-of-india-3.geojson", "test.tiff"],
  ["./gadm/geojsons/Akrotiri and Dhekelia.geojson", "test.tiff"],
  ["./gadm/geojsons/Afghanistan.geojson", "./mapspam/spam2005v3r2_harvested-area_wheat_total.tiff"],
  ["./gadm/geojsons/Akrotiri and Dhekelia.geojson", "./ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif"],
  ["./gadm/geojsons/Ukraine.geojson", "./mapspam/spam2005v3r2_harvested-area_wheat_total.tiff"],
  ["./veneto/veneto.geojson", "./veneto/geonode_atlanteil.tif"],

  ["./santa-maria/santa-maria-mpa.geojson", "./geotiff-test-data/gfw-azores.tif"],

  # https://github.com/perrygeo/python-rasterstats/issues/26
  # ogr2ogr right-edge.shp right-edge.geojson -t_srs EPSG:6933
  ["./antimeridian/right-edge.shp", "gfwfiji_6933_COG.tiff"],
  ["./antimeridian/right-edge.shp", "gfwfiji_6933_COG.tiff", { "boundless": False, "nodata": -9999 }],
  ["./antimeridian/split.shp", "gfwfiji_6933_COG_Binary.tif"],
  ["./antimeridian/across.shp", "gfwfiji_6933_COG_Binary.tif"]
]

for i, (geom, raster, *opts) in enumerate(test_cases):
  print("\n\ncase: " + str(i + 1))
  print("  vector: " + geom)
  print("  raster: " + raster)
  print("  opts: " + str(opts))


  feature_stats = zonal_stats(geom, raster, stats=VALID_STATS, band=1, **(opts[0] if opts else {}))

  try:
    # merge feature_stats (doesn't handle overlapping polygons)
    results = {
      "count": sum(f['count'] for f in feature_stats),
      "min": min(f['min'] for f in feature_stats),
      "max": max(f['max'] for f in feature_stats),
      "sum": sum(f['sum'] for f in feature_stats),
    }
    print("  result:")
    for key, value in results.items():
      print(f"        {key}: {value:,}")
  except Exception as e:
    print(feature_stats)
    raise e


sum_test_cases = [
  "test.tiff",
  "./mapspam/spam2005v3r2_harvested-area_wheat_total.tiff",
  "./ghsl/tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_30_40.tif",
  "./veneto/geonode_atlanteil.tif"
]

for filepath in sum_test_cases:
  with rasterio.open(filepath) as src:
    arr = src.read(1)
    result = arr[arr != src.meta['nodata']].sum()
    print(f"\n\nsum\n{filepath}\n{result}")



country_files = sorted([[f.split(".")[0], f] for f in os.listdir("./gadm/geojsons") if f.endswith(".geojson")])
ghsl_tiles = [f for f in os.listdir("./ghsl/tiles") if f.endswith(".tif")]

# calculate populations
with open("country_populations.csv", "w") as csv_file:
  writer = csv.DictWriter(csv_file, fieldnames=["country", "population"])
  writer.writeheader()
  for country, file in country_files:
    pop = 0
    for tile in ghsl_tiles:
      pop += zonal_stats(f"./gadm/geojsons/{file}", f"./ghsl/tiles/{tile}", stats="sum", band=1)[0]['sum']
    print(f"{country}:  {pop:,}")