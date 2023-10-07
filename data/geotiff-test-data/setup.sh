
# download from https://github.com/GeoTIFF/test-data/
wget https://github.com/GeoTIFF/test-data/archive/refs/heads/main.zip -O geotiff-test-data.zip
unzip -j -o geotiff-test-data.zip "test-data-*/files/*" -d .
unzip spam2005v3r2_harvested-area_wheat_total.tiff.zip
rm geotiff-test-data.zip spam2005v3r2_harvested-area_wheat_total.tiff.zip

gdalwarp -t_srs EPSG:4326 gadas.tif gadas-4326.tif
