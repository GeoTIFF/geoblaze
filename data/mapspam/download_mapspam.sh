if [ ! -f spam2005v3r2_harvested-area_wheat_total.tiff.zip ]; then
    # originally from http://spam05.harvestchoice.org/v3r2/tiff/harvested-area/spam2005v3r2_harvested-area_wheat_total.tiff.zip
    # wget request to harvestchoice.org was failing so put data on an S3 bucket
    wget https://s3.amazonaws.com/geoblaze/spam2005v3r2_harvested-area_wheat_total.tiff.zip;
fi

if [ ! -f spam2005v3r2_harvested-area_wheat_total.tiff ]; then
    unzip spam2005v3r2_harvested-area_wheat_total.tiff.zip
fi
