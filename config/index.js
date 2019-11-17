module.exports = {
  // 端口号
  port: process.env.port || 9527,

  // 默认模板位置
  template: './template/template.html',

  // 默认meta位置
  meta: "./template/template.json",

  // 当页面超过1张时, 是否在顶部插入多页面导航
  // showNav: false,
  showNav: true,

  // 路径写法示例
  // entry: './_demo/*.js',
  // entry: './_demo/**/*.js',

  // composition-api 尝鲜
  // entry: './_composition-api/*.js',

  // 大屏幕
  entry: './_dashboard/GitDataV/index.js',

  // Vue-技巧总结
  // entry: './_tricks/**/*.js',

  // 动画测试
  // entry: './_animation/**/*.js',

  // 第三方组件
  // entry: './_tools/**/*.js',
  // entry: './_list-tree-table/**/*.js',
  // entry: './_validate/**/*.js',

  // admin-template
  // entry: './_admin-linxin/index.js',
  // entry: './_admin-iview/index.js',
  // entry: './_admin-panjc/index.js',
  entry: './_admin-mini/index.js',


  // ElementUI-组件测试
  // entry: './_element/*.js',
  // entry: './_element/**/*.js',

  // antd-vue 组件测试
  // entry: './_antd-vue/**/*.js',

  // veui-组件测试
  // entry: './_veui/*.js',

  // iview-组件测试
  // entry: './_iview/*.js',
  // entry: './_iview/**/*.js',
}
