#!/usr/bin/env bash

REQUIRED_TOOLS=(
  hugo
  git
  go
)

for TOOL in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v "${TOOL}" >/dev/null; then
    echo "${TOOL} is required... "
    exit 1
  fi
done

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 || exit ; pwd -P )"

if test -f "$SCRIPTPATH"/replacements; then
  while read -ra __; do
    go mod edit -dropreplace "${__[0]}"
  done < "$SCRIPTPATH"/replacements
fi

hugo mod get -u ./...
hugo mod tidy

git add go.mod --force
git add go.sum --force

# # just in case: 
# # if we want to add the fully built static website to the repository 
# # this would be the place to add this
# # something like:
# rm -rf public
# hugo
# git add public
# # no need to commit the site, it will be commited on release

if test -f "$SCRIPTPATH"/replacements; then
  while read -ra __; do
    go mod edit -replace "${__[0]}"="${__[1]}"
  done < "$SCRIPTPATH"/replacements
fi

echo "Executed in ${SECONDS}s"
