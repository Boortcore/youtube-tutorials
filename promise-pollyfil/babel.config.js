module.exports = {
  presets: [
    '@babel/preset-env',  // для поддержки новых возможностей JS
    '@babel/preset-typescript',  // для TypeScript
  ],
  ignore: [
    '**/node_modules/**',  // игнорируем node_modules (если это необходимо)
  ],
};
