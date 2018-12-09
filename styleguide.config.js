module.exports = {
  title: 'React Vanilla Form',
  showSidebar: false,
  sections: [
    { content: 'README.md' },
    { components: 'src/index.tsx' },
  ],
  require: [
    'milligram',
  ],
  webpackConfig: {
    resolve: {
      extensions: ['.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
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
