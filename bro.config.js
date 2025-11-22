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
      historyApiFallback: true, // Fix 404 on refresh for SPA routes
      headers: {
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
      }
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
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
    'emotion-diary.api': '/api',
  }
}
