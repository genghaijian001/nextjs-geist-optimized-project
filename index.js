import { defineConfig } from '@tarojs/cli';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  projectName: 'myChauffeurAppInTaro',
  date: '2025-6-19', // 您可以根据需要修改日期
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
    // 定义全局常量
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.TARO_ENV': JSON.stringify(process.env.TARO_ENV),
    '__DEV__': JSON.stringify(isDev),
    // 环境相关配置
    'API_BASE': JSON.stringify(isDev ? 'http://localhost:3000' : ''),
    'WS_BASE_URL': JSON.stringify(isDev ? 'ws://localhost:8080/ws' : ''),
    'MAP_KEY': JSON.stringify('ILPBZ-34ML3-KCB3G-RJNKJ-3WT32-GMFR6')
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@components': path.resolve(__dirname, '..', 'src/components'),
    '@constants': path.resolve(__dirname, '..', 'src/constants'),
    '@services': path.resolve(__dirname, '..', 'src/services'),
    '@utils': path.resolve(__dirname, '..', 'src/utils')
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false
  },
  mini: {
    // 【关键修复】在此处添加 webpackChain 函数来修改 Webpack 配置
    webpackChain(chain) {
      chain.merge({
        resolve: {
          fallback: {
            // 'stream' 模块是最常见的需要 polyfill 的模块
            // 当代码中遇到 require('stream') 时，自动替换为 stream-browserify 这个包
            "stream": require.resolve("stream-browserify"),
            
            // 【新增】根据最新的错误日志，添加以下模块并设置为 false (忽略)
            "pnpapi": false,
            "worker_threads": false,
            
            // 以下是其他常见的 Node.js 核心模块，设置为 false 表示当遇到时，
            // 直接替换为一个空对象，因为小程序环境不支持这些功能。
            "inspector": false,
            "fs": false,
            "net": false,
            "tls": false,
            "crypto": false,
            "path": false,
            "os": false,
            "http": false,
            "https": false,
            "url": false,
            "zlib": false,
            "assert": false,
            "util": false
          }
        }
      });

      // 添加对图片和字体等静态资源的处理规则
      chain.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|svg|webp)$/i)
        .type('asset/resource')
        .set('generator', {
          filename: 'static/images/[name].[hash:8][ext]'
        });

      chain.module
        .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)$/i)
        .type('asset/resource')
        .set('generator', {
          filename: 'static/fonts/[name].[hash:8][ext]'
        });
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024 
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
});
