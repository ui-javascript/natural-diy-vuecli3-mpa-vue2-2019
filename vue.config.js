const glob = require('glob')
const path = require("path")
const fs = require("fs")

function resolve(dir) {
  return path.join(__dirname, dir)
}

function isProd () {
  return process.env.NODE_ENV === 'production'
}

const CONFIG = require("./config")

const port = process.env.port || 9527

// 是否小写字母开头
function shouldReadAsEntry(moduleName) {
  return moduleName.charAt(0).match(/^.*[a-z]+.*$/)
}

function getEntry(globPath) {
  let entries = {}
  let browserPages = []

  glob.sync(globPath).forEach(function (entry) {

    // 切割路径 --> [ '.', '_project', 'module', 'foo.js' ]
    // --> ['_project', 'module', 'foo.js' ]
    // --> ['_project', 'module' ]
    // --> ['module' ]
    let sections = entry.split('/').splice(1)
    // console.log(sections)

    // 模块名称 --> 'foo'
    let moduleName = path.basename(entry, path.extname(entry));
    // console.log(moduleName)

    // 跳过不符合入口规则的文件
    if (!shouldReadAsEntry(moduleName)) {
      return
    }

    // 已获取模块名，section移除最后一个
    sections.pop()

    let template = `./${sections.join('/')}/${moduleName}.html`
    if (!fs.existsSync(template)) {
      template = CONFIG.template
    }

    // 页面信息
    let infoPath = `./${sections.join('/')}/${moduleName}.json`
    if (!fs.existsSync(infoPath)) {
      infoPath = CONFIG.meta
    }

    let context = JSON.parse(fs.readFileSync(infoPath, "utf-8"))
    // console.log(context)

    // 已获取路径参数, 去掉section的工程名
    sections.shift()

    // 生成唯一id, 防止多个目录下路径重复
    let prefix = ''
    // 除了moduleName与当前文件名前缀一致, 且层级为1的
    // 其他情况将section串联，作为uuid的一部分
    if (sections.length > 1 ||
      (sections.length === 1 && moduleName.indexOf(sections[0]) !== 0)) {
      prefix = `${sections.join('-')}-`
    }

    let uuid = `${prefix}${moduleName}`
    browserPages.push(`http://localhost:${port}/${uuid}.html`)

    // entries[moduleName] = [entry, { context }]
    entries[uuid] = [entry, {
      context
    }]


    entries[uuid] = {
      // js入口
      entry,
      // 模板
      template,
      // 输出文件名
      filename: `${uuid}.html`,
      // 文件名
      title: context.title,
    }

  });

  console.log('-------页面--------')
  console.log(browserPages)

  // console.log('-------入口--------')
  // console.log(JSON.stringify(entries).replace(/},/g, "},\n"))

  return entries
}


let pages = getEntry(CONFIG.entry)

module.exports = {
  // 多页面
  pages,
  // 基本配置
  // 1) / 绝对路径
  // 2) ./ 相对路径
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    // open: true,
    overlay: {
      warnings: false,
      errors: true
    },
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // less vars，customize ant design theme

          // 'primary-color': '#F5222D',
          // 'link-color': '#F5222D',
          // 'border-radius-base': '4px'
        },
        // do not remove this line
        javascriptEnabled: true
      }
    }
  },
  // 全局样式
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/_variables.scss'),
        path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        // @fix runtime -> compiler模式
        // https://blog.csdn.net/wxl1555/article/details/83187647
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  },
  chainWebpack: config => {
    
    // @TODO 向html塞参数, 暂时失败了
    // if (!isProd()) {
    //   config
    //     .plugin('html').tap(args => {
    //       args[0].cdn = pages
    //       return args
    //     })
    // }

    config
      .module
        .rule('vue')
        .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
            options.compilerOptions.preserveWhitespace = true
            return options;
        });



    config
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    // @FIXME 多页面拆分出问题 ??
    // config
    //   .when(process.env.NODE_ENV !== 'development',
    //     config => {
    //       config
    //         .optimization.splitChunks({
    //         chunks: 'all',
    //         cacheGroups: {
    //           libs: {
    //             name: 'chunk-libs',
    //             test: /[\\/]node_modules[\\/]/,
    //             priority: 10,
    //             chunks: 'initial' // only package third parties that are initially dependent
    //           },
    //           elementUI: {
    //             name: 'chunk-elementUI', // split elementUI into a single package
    //             priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
    //             test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
    //           },
    //           commons: {
    //             name: 'chunk-commons',
    //             test: path.resolve(__dirname, 'src/components'),
    //             minChunks: 3, //  minimum common number
    //             priority: 5,
    //             reuseExistingChunk: true
    //           }
    //         }
    //       })
    //       config.optimization.runtimeChunk('single')
    //     }
    //   )
  },

}