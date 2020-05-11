const path = require('path');
const glob = require("glob");
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const srcDir = path.join(__dirname, '../src');
let plugins = [];
const getEntry = (env) => {
    env = env || 'dev'
    let files = glob.sync(srcDir + '/js/**/*.js'), // 获取src/js路径下的所有js文件
        entry = {},
        entryFileName,
        outputHtmlName,
        minifyParms;
    if (env == 'prod') { // 产线打包去掉所有注释
        minifyParms = {
            removeComments: true,//去除注释
            collapseWhitespace: true,//去除空格
            removeAttributeQuotes: true //移除属性的引号
        }
    } else {
        minifyParms = false;
    }

    for (let i = 0; i < files.length; i++) { // 便利files下面的所有js
        let matchs = /js\/(\S*).js/.exec(files[i]);
        // matchs = [
        //     'js/index.js',
        //     'index',
        //     index: 79,
        //     input: 'C:/Users/Administrator/Desktop/webpack-multipage-application-master/src/static/js/index.js',
        //     groups: undefined
        // ]
        let filename = '';
        entryFileName = outputHtmlName = matchs[1] // 获取js的文件名
        if (/^_\w*/.test(entryFileName) || /\/_\w*/.test(entryFileName)) {
            continue;
        }
        entry[entryFileName] = files[i]; // 配置多个入口js
        // 入口多页面的对象写法
        // entry: {
        //     index: './app/js/index.js',
        //         index2: './app/js/index2.js'
        // }

        //生成html配置
        plugins.push(new HtmlWebpackPlugin({
            // 打包之后生成出来的html文件名
            filename: outputHtmlName + '.html',
            // 每个html的模版
            template: './src/html/' + outputHtmlName + '.html',
            // 自动将引用插入body
            inject: true,
            // favicon: 'favicon.ico', // 配置页面tabicon
            title: outputHtmlName,
            // 每个html引用的js模块，也可以在这里加上vendor等公用模块
            // chunks: ['manifest',  'vendor', entryFileName],
            chunks: [entryFileName],
            // chunksSortMode: 'dependency',//如果是单页面应用使用这个就行，上面chunks不需要设置
            minify: minifyParms
        }));
    }
    return entry;
}

module.exports = {
    getEntry,
    plugins
}
