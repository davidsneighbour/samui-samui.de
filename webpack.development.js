const { merge } = require('webpack-merge');
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",

  entry: {
    main: path.join(__dirname, "assets/js", "theme.js")
  },

  output: {
    filename: "[name].js",
    chunkFilename: "[id].css"
  },

  devServer: {
    clientLogLevel: 'debug', // 'info': 'silent' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none' | 'warning'
    port: process.env.PORT || 3000,
    contentBase: path.join(process.cwd(), "./static"),
    watchContentBase: true,
    quiet: false,
    open: true,
    historyApiFallback: {
      rewrites: [{from: /./, to: "404.html"}]
    }
  }

});
