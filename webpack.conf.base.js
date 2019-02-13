const fs = require('fs'),
  path = require('path'),
  argv = require('yargs').argv,
  webpack = require('webpack'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  project = require('./project.json'),
  _public = {};

_public.build = env => {
  return {
    entry: `${__dirname}/${project.scripts.source.index}`,
    externals: {
      angular: 'angular',
      vue: 'Vue'
    },
    module: {
      rules: [{
        test: /\.(styl|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { minimize: true } },
          'stylus-loader'
        ]
      }, {
        test: /\.html$/,
        include: [`${__dirname}/${project.scripts.source.root}`],
        use: 'html-loader'
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }, {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: `${project.fonts.dist.root}`,
          }
        }
      }]
    },
    resolve: {
      alias: {
        '@environment$': `${__dirname}/${project.environments.source.root}/${env}.js`,
        '@scripts': `${__dirname}/${project.scripts.source.root}`,
        '@styles': `${__dirname}/${project.styles.source.root}`
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: project.index.source.file,
        minify: {
          collapseWhitespace: true
        }
      }),
      new CopyWebpackPlugin([{
        from: project.images.source.files,
        to: project.images.dist.root
      }, {
        from: project.data.source.files,
        to: project.data.dist.root
      },
      {
        from: project.external.source.root,
        to: `${project.external.dist.root}[1]/[2]`,
        test: new RegExp(`${project.external.source.root}(.*)\/(.*)`)
      }])
    ],
    context: path.resolve(__dirname)
  };
};

module.exports = _public;
