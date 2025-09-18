# Developer Notes

## Install pre-commit hooks

```bash
curl https://pre-commit.com/install-local.py | python -
source ~/.profile
pre-commit install
```

## Setup installation

```bash
npm install
```

## Available Layout Hooks

| Hook Name | Description |
| --------- | ----------- |
| head-start | Fired after "the first three prioritized tags" right after `<head>` starts. The first three `head`er-tags in ALL HTML documents should always be `meta charset`, then `meta viewport`, then `title`. Right after these three this hook is fired. |
| head-end | Fired right before the closing `</head>` tag. If you MUST use javascript in your page head, then make sure to load it here instead of `head-start`. CSS should always be loaded before JavaScript to improve page speed. |
| body-start | Fired right after the opening `<body>` tag. |
| container-start | Fired at the beginning of the main container (below the top navigation, before the content). |
| content-start | Fired at the start inside the content column (if multi columns are used this is only as wide as the content column). |
| content-end | Fired at the end inside the content column (if multi columns are used this is only as wide as the content column). |
| sidebar-start | Fired at the start of the sidebar column. |
| sidebar-end | Fired at the end of the sidebar column. |
| container-end | Fired at the end of the main container, before the footer section begins. |
| body-end | Fired right after the closing `</body>` tag. |


## Youtube thumbnail

- run `./scripts/convert youtube VIDEOID` to load video thumbnail into static folder

## Deployment to Netlify

This repository adds a deployment configuration to work with Netlify.

### Set SNYK plugin

Netlify's SNYK plugin checks all pages for possible security issues. If you do not want to use it look for the following lines in your netflix.toml (around line 50) and remove them:

```toml
# https://github.com/snyk-labs/netlify-plugin-snyk
[[plugins]]
package = "netlify-plugin-snyk"
```

If you want to use this plugin (recommended) then you need to set up an API key for it to properly work.

- see [their documentation](https://support.snyk.io/hc/en-us/articles/360004037537-Authentication-for-third-party-tools) for information on how to retrieve an API-key
- add SNYK_TOKEN with the just retrieved key at _Deploy Settings_ > _Environment Variables_ in your Netlify site.


