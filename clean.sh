# start in data directory
cd data

# setup test-data
echo "---------- Cleaning GeoTIFF Test Data ----------"
cd geotiff-test-data
sh clean.sh
cd ..
echo "---------- Finished Cleaning GeoTIFF Data ----------"

# setup test-data
echo "---------- Cleaning GeoJSON Test Data ----------"
cd geojson-test-data
sh clean.sh
cd ..
echo "---------- Finished Cleaning GeoJSON Data ----------"

# setup gadm
echo "---------- Cleaning GADM Data ----------"
cd gadm
sh clean.sh
cd ..
echo "---------- Finished Cleaning GADM Data ----------"

# setup ghsl
echo "---------- Cleaning GHSL Data ----------"
cd ghsl
sh clean.sh
cd ..
echo "---------- Finished Cleaning GHSL Data ----------"

# setup mapspam
echo "---------- Cleaning MapSpam Data ----------"
cd mapspam
sh clean.sh
cd ..
echo "---------- Finished Cleaning MapSpam Data ----------"

# setup rgb
echo "---------- Cleaning RGB Raster ----------"
cd rgb
sh clean.sh
cd ..
echo "---------- Finished Cleaning RGB Raster ----------"

# setup veneto
echo "---------- Cleaning Veneto Raster ----------"
cd veneto
sh clean.sh
cd ..
echo "---------- Finished Cleaning Veneto Raster ----------"

# go back to root
cd ..
