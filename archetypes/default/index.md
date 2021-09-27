---

# This is the dnb-org-garuda frontmatter template. 
# Remove comments and items you won't need in your daily work with Hugo.
# Copy a smaller version of this file to /archetypes/default.md in your
# own repository to overwrite this version.

# default front matter that you probably always need:
title: "{{ replace .Name "-" " " | title }}"
description: ""
date: {{ .Date }}
lastmod: {{ .Date }}
url: /{{ now.Format "2006" }}/{{ now.Format "01" }}/{{ .Name }}
tags:
    - tag1
    - tag2
# set to false to hide comments on this page
# remove this if you want to show comments for less clutter
hide_comments: false
hide_sharebuttons: false
hide_related: false
# tbd.
draft: true
# tbd.
aliases:
    - url
# tbd.
linktitle: "use for linking to this post"
# tbd.
resources:
    - src: "file"
      name: "name"
      title: "title"
---

