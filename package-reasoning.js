module.exports = {

  "devDependencies": {

    // general
    "npm-check": "5.9.2",
    "npm-run-all": "4.1.5",
    "cross-env": "7.0.3",

    // dnb-hugo configuration packages
    "@dnb-hugo/browserslist-config": "github:dnb-hugo/browserslist-config",
    "@dnb-hugo/commitlint-config": "github:dnb-hugo/commitlint-config",
    "@dnb-hugo/es-config": "github:dnb-hugo/eslint-config",
    "@dnb-hugo/remark-preset-lint": "github:dnb-hugo/remark-preset-lint",
    "@dnb-hugo/standard-version-config": "github:dnb-hugo/standard-version-config",
    "@dnb-hugo/stylelint-config": "github:dnb-hugo/stylelint-config",
    "@dnb-hugo/textlint-config": "github:dnb-hugo/textlint-config",

    // versioning
    "husky": "4.3.7",
    "standard-version": "9.1.0",

    // hint
    "hint": "6.1.1",
    "@hint/configuration-development": "8.1.0",

    // algolia search
    "atomic-algolia": "0.3.19",

    // webpack
    "webpack": "5.11.1",
    "webpack-cli": "4.3.1",
    "webpack-merge": "5.7.3",

    // webpack stylesheets
    "autoprefixer": "10.2.1",
    "cssnano": "4.1.10",
    "pixrem": "5.0.0",
    "postcss": "8.2.4",
    "postcss-cli": "8.3.1",
    "precss": "4.0.0",

    // webpack javascripts
    "uglifyjs-webpack-plugin": "2.2.0",
    "babel-loader": "8.2.2",
    "lazysizes": "5.3.0",

    // favicon module
    "cli-real-favicon": "0.0.8",

  },

  "scripts": {

    // release scripts
    "commitlint": "commitlint --from=HEAD~1",
    "release": "standard-version --release-as patch -a -t \"v\" && ./bin/release-hook-postrelease.sh",
    "release-next": "standard-version --release-as minor -a -t \"v\" && ./bin/release-hook-postrelease.sh",
    "release-major": "standard-version --release-as major -a -t \"v\" && ./bin/release-hook-postrelease.sh",
    "update-check": "npm-check -E --specials=babel,bin,commitizen,eslint,husky,webpack",
    "update": "npm-check -u -E --specials=babel,bin,commitizen,eslint,husky,webpack",

    // lint
    "lint": "npm run lint:markdown",
    "lint:markdown": "linkinator \"content/**/*.md\" --markdown",
    "check": "hint http://localhost:1313",
    "check2": "hint . ",

    // hugo
    "serve": "npm run build:webpack && run-p serve:**",
    "serve:hugo": "hugo server --minify --disableFastRender --i18n-warnings --navigateToChanged  --templateMetrics --templateMetricsHints --verbose --verboseLog --path-warnings --buildDrafts --buildExpired --buildFuture --watch --enableGitInfo --forceSyncStatic --log true --logFile hugo.log --verbose",
    "serve:webpack": "webpack --watch --config webpack.development.js",

    // build
    "build": "npm run build:webpack && npm run build:hugo",
    "build:hugo": "hugo",
    "build:webpack": "cross-env NODE_ENV=production webpack --config webpack.production.js",

    // clean
    "clean:webpack": "rm -rf static/main*.js && rm data/dnb/webpack/config.json",

    // algolia search
    "algolia": "hugo --quiet && atomic-algolia && rm -rf public",

    // favicons
    "favicon-create": "real-favicon generate faviconDescription.json ./resources/_gen/assets/faviconData.json static/images/favicon/",
    "favicon-update": "real-favicon check-for-update --fail-on-update ./resources/_gen/assets/faviconData.json",

  },

}
