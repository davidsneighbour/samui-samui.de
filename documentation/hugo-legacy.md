# Hugo legacy version

Up to 17 July 2026, this site was built with Hugo. The Astro migration starts directly after commit [`fc3e7c8a311b9dbfb3f93ba3abd48cc0f4d208e1`](https://github.com/davidsneighbour/samui-samui.de/commit/fc3e7c8a311b9dbfb3f93ba3abd48cc0f4d208e1) ("docs: add HUGO-COMPATIBILITY.md, since apparently we need it now"). That commit is the last state of the Hugo site.

A `legacy/hugo` branch pointed to this commit. The commit is part of the `main` history, so the branch had no commits of its own and was deleted on 27 November 2026.

To look at the Hugo version, check out the commit:

```bash
git switch --detach fc3e7c8a311b
```

To make a branch again:

```bash
git branch legacy/hugo fc3e7c8a311b
```
