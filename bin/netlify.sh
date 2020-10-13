#!/bin/bash

hugo mod get -u ./...
hugo --gc --minify
rm -rf public/posts
