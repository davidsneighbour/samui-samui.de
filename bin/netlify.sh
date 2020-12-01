#!/bin/bash

git config --global --add url."git@github.com:".insteadOf "https://github.com/"
hugo
rm -rf public/posts
