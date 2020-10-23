#!/bin/bash

cp bin/go.mod.repo go.mod

hugo mod get -u ./...
hugo mod tidy
rm -rf public
#hugo mod vendor

cp go.mod bin/go.mod.repo

#git add _vendor
git add go.mod
git add go.sum

{
  echo 'replace github.com/davidsneighbour/dnb-hugo-garuda => /home/patrick/Projects/Hugo/dnb-hugo-garuda'
  echo 'replace github.com/davidsneighbour/dnb-hugo/netlification => /home/patrick/Projects/Hugo/dnb-hugo/netlification'
  echo 'replace github.com/davidsneighbour/dnb-hugo/renderhooks => /home/patrick/Projects/Hugo/dnb-hugo/renderhooks'
  echo 'replace github.com/davidsneighbour/dnb-hugo/robots => /home/patrick/Projects/Hugo/dnb-hugo/robots'
  echo 'replace github.com/davidsneighbour/dnb-hugo/favicons => /home/patrick/Projects/Hugo/dnb-hugo/favicons'
  echo 'replace github.com/davidsneighbour/dnb-hugo/shortcodes => /home/patrick/Projects/Hugo/dnb-hugo/shortcodes'
  echo 'replace github.com/davidsneighbour/dnb-hugo-libs/bootstrap4 => /home/patrick/Projects/Hugo/dnb-hugo-libs/bootstrap4'
} >> go.mod

hugo --gc
git add -f public
