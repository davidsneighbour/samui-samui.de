#!/bin/bash

git config --global --add url."git@github.com:".insteadOf "https://github.com/"
hugo --gc --minify
rm -rf public/posts
