module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    API_BASE: '"http://localhost:3000"',
    MAP_KEY: '"ILPBZ-34ML3-KCB3G-RJNKJ-3WT32-GMFR6"',
    // 开发环境特定的常量定义
    __DEV__: true,
    API_ENV: '"dev"'
  },
  logger: {
    quiet: false,
    stats: true
  },
  mini: {
    debugReact: true,
    hot: true,
    webpackChain(chain) {
      // 开发环境开启source-map便于调试
      chain.merge({
        devtool: 'eval-cheap-module-source-map'
      })
      // 配置开发环境的webpack插件
      chain.plugin('fastRefresh')
        .use(require('@pmmmwh/react-refresh-webpack-plugin'))

      // 添加Node.js核心模块的fallback配置
      chain.resolve.fallback.set('stream', require.resolve('stream-browserify'));
    }
  },
  h5: {
    devServer: {
      host: 'localhost',
      port: 10086,
      open: true,
      historyApiFallback: true,
      proxy: {
        '/api/': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      }
    }
  }
}
