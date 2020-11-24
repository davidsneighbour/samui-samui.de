#!/bin/bash

# access "${arr[0]}", "${arr[1]}"
declare -a arr=(
  "../../Hugo/dnb-hugo"
  "../dnb-hugo-garuda"
  "../dnb-hugo-garuda-template"
  "../dnb-hugo-libs"
  "../../Me/dnb-hugo-namespace"
  "../samui-samui.de"
)

for i in "${arr[@]}"
do
  cd "$i" || exit
  echo "$i": "$(git status --porcelain=1 | wc -l)" changes
done
