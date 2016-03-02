'use strict'
var path = require('path')
var webpack = require('webpack')
var nodeModulesDir = path.resolve(__dirname, 'node_modules')

var deps = [
  /*'react/dist/react.js',
  'react-dom/dist/react-dom.js',
  'redux/dist/redux.js',
  'react-redux/dist/react-redux.js',
  'react-leaflet/dist/react-leaflet.js',*/
];

var config = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    /*'webpack-dev-server/client?http://0.0.0.0:3000',
    'webpack/hot/only-dev-server',*/
    'webpack-hot-middleware/client',
    'babel-polyfill',
    './src/index.jsx',
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    alias: {}
  },
  module: {
    noParse: [],
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel'],
        exclude: [nodeModulesDir]
      },
      {
        test: /\.(png|woff2?)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

deps.forEach(function (dep) {
  var depPath = path.resolve(nodeModulesDir, dep)
  config.resolve.alias[dep.split(path.sep)[0]] = depPath
  config.module.noParse.push(depPath)
})

module.exports = config
