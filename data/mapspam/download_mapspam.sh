if [ ! -f spam2005v3r2_harvested-area_wheat_total.tiff.zip ]; then
    wget http://spam05.harvestchoice.org/v3r2/tiff/harvested-area/spam2005v3r2_harvested-area_wheat_total.tiff.zip
fi

if [ ! -f spam2005v3r2_harvested-area_wheat_total.tiff ]; then
    unzip spam2005v3r2_harvested-area_wheat_total.tiff.zip
fi
