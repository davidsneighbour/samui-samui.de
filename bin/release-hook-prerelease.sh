#!/bin/bash

declare -a MODULES=(
  'github.com/dnb-hugo/debugprint'
  'github.com/dnb-hugo/garuda'
  'github.com/dnb-hugo/components/favicon'
  'github.com/dnb-hugo/components/functions'
  'github.com/dnb-hugo/components/netlification'
  'github.com/dnb-hugo/components/opensearch'
  'github.com/dnb-hugo/components/renderhooks'
  'github.com/dnb-hugo/components/robots'
  'github.com/dnb-hugo/components/search-algolia'
  'github.com/dnb-hugo/components/sitemap'
  'github.com/dnb-hugo/shortcodes'
  'github.com/dnb-hugo/blocks/bootstrap5'
  'github.com/dnb-hugo/libraries/bootstrap5'
  'github.com/dnb-hugo/libraries/bootstrap-icons'
  'github.com/dnb-hugo/libraries/popper.js'
)
declare -a REPLACE=(
  '/home/patrick/Projects/dnb-hugo/debugprint'
  '/home/patrick/Projects/dnb-hugo/garuda'
  '/home/patrick/Projects/dnb-hugo/components/favicon'
  '/home/patrick/Projects/dnb-hugo/components/functions'
  '/home/patrick/Projects/dnb-hugo/components/netlification'
  '/home/patrick/Projects/dnb-hugo/components/opensearch'
  '/home/patrick/Projects/dnb-hugo/components/renderhooks'
  '/home/patrick/Projects/dnb-hugo/components/robots'
  '/home/patrick/Projects/dnb-hugo/components/search-algolia'
  '/home/patrick/Projects/dnb-hugo/components/sitemap'
  '/home/patrick/Projects/dnb-hugo/shortcodes'
  '/home/patrick/Projects/dnb-hugo/blocks/bootstrap5'
  '/home/patrick/Projects/dnb-hugo/libraries/bootstrap5'
  '/home/patrick/Projects/dnb-hugo/libraries/bootstrap-icons'
  '/home/patrick/Projects/dnb-hugo/libraries/popper.js'
)

for i in "${MODULES[@]}"
do
  go mod edit -dropreplace "$i"
done

hugo mod get -u ./...
hugo mod tidy

git add go.mod
git add go.sum

for i in "${!MODULES[@]}"; do
  go mod edit -replace "${MODULES[$i]}"="${REPLACE[$i]}"
done
