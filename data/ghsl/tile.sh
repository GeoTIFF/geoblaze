echo "starting tiling of ghsl data"

$_="_";

src_filename="GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326";
src_extension=".tif";
src_dataset="${src_filename}${src_extension}";
echo "src_dataset: ${src_dataset}";

for latitude in `seq 90 -10 -80`;
  do
    for longitude in `seq -180 10 170`;
      do
        ulx=$longitude;
        uly=$latitude;
        lrx=$(( $longitude + 10 ));
        lry=$(( $latitude - 10 ));
        projwin="$ulx $uly $lrx $lry";
        echo "projwin: $projwin";
        dst_dataset="tiles/GHS_POP_GPW42015_GLOBE_R2015A_54009_1k_v1_0_4326_${ulx}_${uly}${src_extension}";
        echo "running: gdal_translate -projwin $projwin $src_dataset $dst_dataset"
        gdal_translate -projwin $projwin $src_dataset $dst_dataset;
      done
  done   
