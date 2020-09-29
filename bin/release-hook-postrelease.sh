#!/bin/bash

NEWVERSION=$(cat "newversion")
OLDVERSION=$(cat "oldversion")

# push to repo
git push --follow-tags origin main

# retrieve github token
GREN_GITHUB_TOKEN=$(grep GREN_GITHUB_TOKEN .env | xargs)
IFS='=' read -ra GREN_GITHUB_TOKEN <<<"$GREN_GITHUB_TOKEN"
GREN_GITHUB_TOKEN=${GREN_GITHUB_TOKEN[1]}

# create release
gren release --token="$GREN_GITHUB_TOKEN" --tags="$NEWVERSION" --config .grenrc.js

rm newversion
rm oldversion
rm releasedatetime

git add CHANGELOG.md
git commit --amend --no-edit
git push origin --force
