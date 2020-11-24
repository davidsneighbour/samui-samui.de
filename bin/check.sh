#!/bin/bash

# access "${arr[0]}", "${arr[1]}"
declare -a arr=(
  "Hugo/dnb-hugo"
  "Hugo/dnb-hugo-garuda"
  "Hugo/dnb-hugo-garuda-template"
  "Hugo/dnb-hugo-libs"
  "Me/dnb-hugo-namespace"
  "Me/samui-samui.de"
)

for i in "${arr[@]}"
do
  cd ../../"$i" || exit
  echo "$i": "$(git status --porcelain=1 | wc -l)" changes
done
