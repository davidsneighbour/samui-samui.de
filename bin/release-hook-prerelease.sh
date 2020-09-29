#!/bin/sh

# log the start time for the release script
TIMESTAMP=$(date +%s)
echo "$TIMESTAMP" > "releasedatetime"

OLDVERSION=$(cat .version)
echo "$OLDVERSION" > "oldversion"
