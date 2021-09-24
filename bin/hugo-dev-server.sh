#!/usr/bin/env bash

# cleanup hugo loggin
npm run clean:hugo

# starting hugo server
hugo server \
    --gc \
    --bind 192.168.1.201 \
    --port 1313 \
    --environment development \
    --disableFastRender \
    --i18n-warnings \
    --navigateToChanged \
    --templateMetrics \
    --templateMetricsHints \
    --path-warnings \
    --poll 1s \
    --cleanDestinationDir \
    --renderToDisk \
    --buildDrafts --buildExpired --buildFuture \
    --watch \
    --enableGitInfo \
    --forceSyncStatic \
    --log true --logFile hugo.log \
    --verbose \
    --verboseLog \
    --debug \
    --meminterval 5s \
    --memstats hugo_memory.log \
    --print-mem
