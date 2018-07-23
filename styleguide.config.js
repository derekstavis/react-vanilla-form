module.exports = {
  title: 'React Vanilla Form',
  showSidebar: false,
  sections: [
    { content: 'README.md' },
    { components: 'src/index.js' },
  ],
  require: [
    'milligram',
  ],
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader?modules'
        }
      ],
    },
  },
}
