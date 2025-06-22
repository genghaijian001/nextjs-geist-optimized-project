const { WeappTailwindcssDisabled } = require('@weapp-tailwindcss/postcss');

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    '@weapp-tailwindcss/postcss': WeappTailwindcssDisabled ? false : {
      // 具体配置项
      excludeFiles: [],
      cssPreflight: {
        'border-color': false,
        'line-height': false,
      },
    }
  }
};
