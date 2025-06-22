module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {
    API_BASE: '"https://api.your-production-domain.com"',
    MAP_KEY: '"ILPBZ-34ML3-KCB3G-RJNKJ-3WT32-GMFR6"',
    // 生产环境特定的常量定义
    __DEV__: false,
    API_ENV: '"prod"'
  },
  mini: {
    webpackChain(chain) {
      chain.optimization.minimize(true)
      chain.plugin('terser').use(require('terser-webpack-plugin'), [{
        terserOptions: {
          compress: true,
          keep_classnames: true,
          keep_fnames: true
        }
      }])
      // 生产环境优化配置
      chain.optimization.splitChunks({
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        name: true,
        cacheGroups: {
          vendor: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
    },
    commonChunks: ['runtime', 'vendors', 'common', 'taro'],
    optimizeMainPackage: {
      enable: true
    },
    sourceMapType: 'none'
  },
  h5: {
    enableSourceMap: false,
    enableExtract: true,
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[hash:8].css',
      chunkFilename: 'css/[name].[chunkhash:8].css'
    }
  }
}
