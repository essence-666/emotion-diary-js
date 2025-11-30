const pkg = require('./package')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    },
    devServer: {
      historyApiFallback: true,
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
