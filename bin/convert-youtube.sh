#!/bin/bash

# retrieve thumbnail
curl -o static/images/youtube/$1.jpg https://i.ytimg.com/vi/$1/hqdefault.jpg
