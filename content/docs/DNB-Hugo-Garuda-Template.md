## DNB Hugo Garuda Template - a working sample template you can use for your own site

| :exclamation:  This documentation is work in progress and can change in parts over time.   |
|----|

See [dnb-org-garuda-template](/davidsneighbour/dnb-org-garuda-template) for an example repo that you can use as a template to work with this theme. You can fork that repo without adding all the revisions to date. Please keep issues related to this template in [this themes repository](/davidsneighbour/dnb-org-garuda/issues).

## Installation

- run `npm install` to install packages
- run `./scripts/copy-files.sh` to copy used library to the assets folder
- run `git submodule update --init --recursive` in the root folder

## Youtube thumbnail

- run `./scripts/convert youtube VIDEOID` to load video thumbnail into static folder

## Setup and update Algolia search

- copy `.env.sample` to `.env`
- fill in the info from https://www.algolia.com/apps &gt; API keys
- run `npm install -g atomic-algolia` to install globally 
- run `npm run algolia` whenever there are updates to the content

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
