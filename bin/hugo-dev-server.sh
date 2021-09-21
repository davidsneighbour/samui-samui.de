#!/usr/bin/env bash

hugo server \
    --minify  \
    --disableFastRender  \
    --i18n-warnings  \
    --navigateToChanged   \
    --templateMetrics  \
    --templateMetricsHints  \
    --verboseLog  \
    --path-warnings  \
    --buildDrafts --buildExpired --buildFuture  \
    --watch  \
    --enableGitInfo  \
    --forceSyncStatic  \
    --log true --logFile hugo.log  \
    --verbose
