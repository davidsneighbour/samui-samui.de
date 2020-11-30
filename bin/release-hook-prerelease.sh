#!/bin/bash

declare -a MODULES=(
  'github.com/davidsneighbour/dnb-hugo-garuda'
  'github.com/davidsneighbour/dnb-hugo/favicon'
  'github.com/davidsneighbour/dnb-hugo/functions'
  'github.com/davidsneighbour/dnb-hugo/netlification'
  'github.com/davidsneighbour/dnb-hugo/renderhooks'
  'github.com/davidsneighbour/dnb-hugo/robots'
  'github.com/davidsneighbour/dnb-hugo/sitemap'
  'github.com/davidsneighbour/dnb-hugo/shortcodes'
  'github.com/davidsneighbour/dnb-hugo-libs/bootstrap5'
  'github.com/davidsneighbour/dnb-hugo-libs/bootstrap-icons'
  'github.com/davidsneighbour/dnb-hugo-libs/popper.js'
)
declare -a REPLACE=(
  '/home/patrick/Projects/Hugo/dnb-hugo-garuda'
  '/home/patrick/Projects/Hugo/dnb-hugo/favicon'
  '/home/patrick/Projects/Hugo/dnb-hugo/functions'
  '/home/patrick/Projects/Hugo/dnb-hugo/netlification'
  '/home/patrick/Projects/Hugo/dnb-hugo/renderhooks'
  '/home/patrick/Projects/Hugo/dnb-hugo/robots'
  '/home/patrick/Projects/Hugo/dnb-hugo/sitemap'
  '/home/patrick/Projects/Hugo/dnb-hugo/shortcodes'
  '/home/patrick/Projects/Hugo/dnb-hugo-libs/bootstrap5'
  '/home/patrick/Projects/Hugo/dnb-hugo-libs/bootstrap-icons'
  '/home/patrick/Projects/Hugo/dnb-hugo-libs/popper.js'
)

for i in "${MODULES[@]}"
do
  go mod edit -dropreplace $i
done

hugo mod get -u ./...
hugo mod tidy
rm -rf public

git add go.mod
git add go.sum

for i in "${!MODULES[@]}"; do
  go mod edit -replace ${MODULES[$i]}=${REPLACE[$i]}
done

hugo --gc --minify
git add -f public
