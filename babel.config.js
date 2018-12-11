module.exports = {
	sourceMaps: "inline",
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    [
      'babel-plugin-module-resolver',
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx', 'json'],
        root: ['./src'],
      },
    ],
  ],
};
