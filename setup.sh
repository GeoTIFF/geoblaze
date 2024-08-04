set -e

# start in data directory
cd data

# setup test-data
echo "---------- Setting up GeoTIFF Test Data ----------"
cd geotiff-test-data
bash setup.sh
cd ..
echo "---------- Finished Setting up GeoTIFF Data ----------"

# setup test-data
echo "---------- Setting up GeoJSON Test Data ----------"
cd geojson-test-data
bash setup.sh
cd ..
echo "---------- Finished Setting up GeoJSON Data ----------"

# setup gadm
echo "---------- Setting up GADM Data ----------"
cd gadm
bash download_gadm.sh
node ./extract_countries.js
bash trim_gadm.sh
cd ..
echo "---------- Finished Setting up GADM Data ----------"

# setup ghsl
echo "---------- Setting up GHSL Data ----------"
cd ghsl
bash setup.sh
cd ..
echo "---------- Finished Setting up GHSL Data ----------"

# setup mapspam
echo "---------- Setting up MapSpam Data ----------"
cd mapspam
bash download_mapspam.sh
bash tile.sh
cd ..
echo "---------- Finished Setting up MapSpam Data ----------"

# setup rgb
echo "---------- Setting up RGB Raster ----------"
cd rgb
bash setup.sh
cd ..
echo "---------- Finished Setting up RGB Raster ----------"

# setup veneto
echo "---------- Setting up Veneto Raster ----------"
cd veneto
bash setup.sh
cd ..
echo "---------- Finished Setting up Veneto Raster ----------"

# generate truth data using rasterstats
pip install --upgrade pip
pip install pipenv
pipenv install fiona rasterio rasterstats
pipenv run python3 create_expected_truth_data.py

# go back to root
cd ..
