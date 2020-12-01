#!/bin/bash

git config --global --add url."git@github.com:".insteadOf "https://github.com/"
hugo mod get -u ./...
hugo
rm -rf public/posts
