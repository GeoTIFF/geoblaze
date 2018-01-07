import json
from os import listdir
from os.path import join
import rasterio as rio

path_to_admins = "admins"

results = []

for filename in listdir(path_to_admins):
    with rio.open(join(path_to_admins, filename)) as f:
        results.append({"name": filename.replace(".tif",""), "population": float(f.read().sum())})

print(json.dumps(results))