echo "starting tiling of mapspam data"

$_="_";

src_filename="spam2005v3r2_harvested-area_wheat_total";
src_extension=".tiff";
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
        #echo "projwin: $projwin";
        dst_dataset="tiles/${src_filename}_${ulx}_${uly}.tif";
        #echo $dst_dataset
        gdal_translate -projwin $projwin $src_dataset $dst_dataset;
      done
  done   
