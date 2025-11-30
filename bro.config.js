const pkg = require('./package')
const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    },
    module: {
      rules: [
        {
          test: /\.glb$/,
          type: 'asset/resource',
          generator: {
            filename: 'models/[name][ext]',
          },
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public/models'),
            to: 'models',
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    devServer: {
      historyApiFallback: {
        // Exclude static files from history fallback
        disableDotRule: true,
      },
      static: [
        {
          directory: path.join(__dirname, 'public'),
          publicPath: '/',
          watch: true,
        },
        {
          directory: path.join(__dirname, 'dist'),
          publicPath: '/',
          watch: false,
        },
      ],
      headers: {
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
      }
    }
  },
  navigations: {
    'emotion-diary.main': '/emotion-diary',
    'emotion-diary.login': '/emotion-diary/login',
    'emotion-diary.register': '/emotion-diary/register',
  },
  features: {
    'emotion-diary': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    'emotion-diary.api': 'https://emotion-diary.aquaf1na.fun/api/v1',
  }
}
