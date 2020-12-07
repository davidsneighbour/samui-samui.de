#!/bin/bash

################################################################################
# A bash script to publish your Hugo website to Netlify.
# Opiniated like any other DNB product :)
################################################################################

# leaving this git config line in. sometimes you want to access a private repo
# and in that case it's better if you access it via ssh instead of https.
# this config line does configure your Netlify session to do that.
# git config --global --add url."git@github.com:".insteadOf "https://github.com/"

# updating modules
hugo mod get -u ./...

# compiling the site (see, no --minify)
hugo --gc

# removing files that are not required to exist in the global scope
rm -rf public/posts
