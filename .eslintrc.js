module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-tabs': 'off',
		// allow paren-less arrow functions
		'arrow-parens': 0,
		// allow async-await
		'generator-star-spacing': 0,
		// 关闭语句强制分号结尾
		"semi": [0],
		'eol-last': 0,//这句话表示在文件末尾可以不加回车
    'space-before-function-paren': 0, //这句话表示在函数后可以不加空格
    "indent": ["off", 2]
  }
}
