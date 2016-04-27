'use strict'
var path = require('path')
var webpack = require('webpack')
var nodeModulesDir = path.resolve(__dirname, 'node_modules')

var NODE_ENV = process.env.NODE_ENV

var deps = [
  /*
  'babel-polyfill/dist/polyfill.js',
  'react/dist/react.js',
  'react-dom/dist/react-dom.js',
  'redux/dist/redux.js',
  'react-redux/dist/react-redux.js',
  'react-leaflet/dist/react-leaflet.js',
  'immutable/dist/immutable.js',
  'moment/moment.js',
  'draft-js/dist/draft.js'
  */
]

var config = {
  entry: [
    'babel-polyfill',
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
    // publicPath: '/static/'
  },
  resolve: {
    alias: {},
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.js', '.jsx']
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
        test: /\.(png)$/,
        loader: 'url-loader?limit=100000'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': NODE_ENV === 'development' ? '"development"' : '"production"',
      'process.env.BUILD_GPX': JSON.stringify(JSON.parse(process.env.BUILD_GPX || 'false'))
    })
  ]
}

if (NODE_ENV === 'development') {
  config.devtool = 'cheap-module-eval-source-map'
  config.entry.unshift('webpack-hot-middleware/client')
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin())
} else {
  config.plugins.unshift(new webpack.optimize.DedupePlugin())
  config.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }))
}

deps.forEach(function (dep) {
  var depPath = path.resolve(nodeModulesDir, dep)
  config.resolve.alias[dep.split(path.sep)[0]] = depPath
  config.module.noParse.push(depPath)
})

module.exports = config
