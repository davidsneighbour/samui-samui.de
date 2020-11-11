---

# This is the dnb-hugo-garuda frontmatter template. 
# Remove comments and items you won't need in your daily work with Hugo.
# Copy a smaller version of this file to /archetypes/default.md in your
# own repository to overwrite this verstion.

# default front matter that you probably always need:
title: "{{ replace .Name "-" " " | title }}"
description: ""
date: {{ .Date }}
lastmod: {{ .Date }}
url: /new/url/to/post
tags:
    - tag1
    - tag2
leute:
    - prayuth chan-ocha

# Override author by post. Define your main author in the config.toml.
author: 
    name: Patrick Kollitsch
    homepage: https://kollitsch.de
    
# set to false to hide comments on this page
# remove this if you want to show comments for less clutter
hide_comments = false
hide_sharebuttons = false
hide_related = false

# tbd.
type: post|page

# tbd.
layout: single

# tbd.
draft: true

# tbd.
ogtype: "article"

# tbd.
schema:
    - type: "BlogPost|NewsArticle|Article"

# tbd.
aliases:
    - url

# tbd.
linktitle: "use for linking to this post"

# tbd.
images:
    - image.jpg

# tbd.
resources:
    - src: "file"
      name: "name"
      title: "title"
---
