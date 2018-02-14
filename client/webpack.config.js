// webpack.config.js
const webpack = require('webpack');

const loaders = [];
// JS loaders
const js_loaders = {
  test: /\.js$/,
  loaders: ['babel'],
  exclude: /node_modules/
};
loaders.push(js_loaders);
module.exports = {
  devtool: 'source-map',
  entry: './app-client.js',
  output: {
    path: __dirname + '/public/dist',
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  module: {
    loaders
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_URL': JSON.stringify(process.env.APP_URL)
    })
 ]
};
