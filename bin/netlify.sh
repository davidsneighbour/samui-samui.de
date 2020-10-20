#!/bin/bash

git config --global --add url."git@github.com:".insteadOf "https://github.com/"
hugo mod get -u ./...
hugo --gc --minify
rm -rf public/posts
