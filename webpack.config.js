'use strict'
var path = require('path')
var nodeModulesDir = path.resolve(__dirname, 'node_modules')

var deps = [
  'react/dist/react.js',
  'react-dom/dist/react-dom.js',
  'redux/dist/redux.js',
  'react-redux/dist/react-redux.js',
  'react-leaflet/dist/react-leaflet.js',
];

var config = {
  entry: './src/index.jsx',
  output: path.resolve(__dirname, 'build'),
  resolve: {
    alias: {}
  },
  module: {
    noParse: [],
    loaders: [
      {
        test: /\.css$/,
        //loader: 'style-loader!css-loader!purifycss-loader'
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: [nodeModulesDir]
      },
      {
        test: /\.(png|woff2?)$/,
        loader: 'url-loader?limit=100000'
      },
    ]
  }
}

deps.forEach(function (dep) {
  var depPath = path.resolve(nodeModulesDir, dep)
  config.resolve.alias[dep.split(path.sep)[0]] = depPath
  config.module.noParse.push(depPath)
})

module.exports = config
