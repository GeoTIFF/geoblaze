# download from https://github.com/DanielJDufour/geojson-test-data/
wget https://github.com/DanielJDufour/geojson-test-data/archive/refs/heads/main.zip -O geojson-test-data.zip
unzip -o geojson-test-data.zip "geojson-test-data-*/files/*" -d .
mv ./geojson-test-data-main/files/* .
rm -r geojson-test-data-main
rm geojson-test-data.zip
