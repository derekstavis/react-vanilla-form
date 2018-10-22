export default {
  src: './src',
  title: 'React Vanilla Form',
  description: 'An unobtrusive form serializer and validator that works by following standards.',
  modifyBundlerConfig: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: require.resolve('file-loader'),
    })
    return config
  }
}
