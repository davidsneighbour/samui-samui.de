[![Netlify Status](https://api.netlify.com/api/v1/badges/e2de71bc-05fc-4900-ad01-89ebdd5774e0/deploy-status)](https://app.netlify.com/sites/eloquent-morse-196fd2/deploys)

# installation

- run `npm install` to install packages
- run `./scripts/copy-files.sh` to copy used library to the assets folder
- run `git submodule update --init --recursive` in the root folder

# youtube thumbnail

- run `./scripts/convert youtube VIDEOID` to load video thumbnail into static folder

# setup and update algolia search

- copy `.env.sample` to `.env`
- fill in the info from https://www.algolia.com/apps &gt; API keys
- run `npm install -g atomic-algolia` to install globally 
- run `npm run algolia` whenever there are updates to the content

