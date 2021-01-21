const {GenerateSW} = require('workbox-webpack-plugin');
const path = require("path");

module.exports = {

  mode: 'production',

  //target: ['web', 'es2017'],

  entry: {
    main: path.join(__dirname, 'assets/js/sw', 'service-worker.js')
  },

  output: {
    path: path.join(__dirname, 'static'),
    filename: "[name].js",
  },

  performance: {
    maxEntrypointSize: 400000,
    maxAssetSize: 100000,
    hints: 'warning'
  },

  plugins: [
    // Other plugins...

    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    })
  ]

};
