#!/bin/sh

VERSION=$(cat .version)

#sed -i 's/^Version .*/Version '"$VERSION"'/' LICENSE.md
#git add LICENSE.md

NEWVERSION=$(cat .version)
echo "$NEWVERSION" > "newversion"
