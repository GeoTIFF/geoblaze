# start in data directory
cd data

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

# go back to root
cd ..
