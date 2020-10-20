#!/bin/bash

# install required programs via
# `sudo apt install libjpeg-progs pngcrush`

# you will need the libjpeg-progs package to run this - note the -progressive option added
find ./static -name "*.jpg" -exec jpegtran -optimize -progressive -outfile "{}" "{}" \; 

# handle pngs with pngcrush -ow > overwrite file
find ./static -name "*.png" -exec pngcrush -ow "{}"  \;
