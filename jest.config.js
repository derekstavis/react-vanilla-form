module.exports = {
  moduleDirectories: ['./node_modules', './src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ["**/*.test.{ts,tsx}"],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
