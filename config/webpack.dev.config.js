const utils = require('./util');
const path = require('path');
const webpack = require('webpack');
const distDir = path.join(__dirname, '../dist');
const portfinder = require('portfinder');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const plugins = [
    new CleanWebpackPlugin(['dist'], {
        root: path.resolve(__dirname, '../'),   //根目录
        verbose: true,        　　　　　　　　　　//开启在控制台输出信息
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
        filename: 'less/[name].[chunkhash:8].css',
        allChunks: true
    }),
];
const devWebpackConfig = {
    entry: utils.getEntry(),
    output: {
        path: distDir,
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js'
    },
    module: {
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                //include表示直接去哪些文件夹下面找,可以加快速度
                include: [path.join(__dirname, '../src/js')]
            },
            {
                test: /\.(css|less)$/,
                loader: 'style-loader!css-loader!px2rem-loader?remUnit=30!less-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader?limit=4000&name=images/[name]-[hash:5].[ext]'
            }
        ]
    },
    devServer: {
        // 配置http服务的根目录，以dist为开启服务时的根目录
        contentBase: path.join(__dirname, '../dist'),
        host: 'localhost',
        port: 8080,
        inline: true,
        hot: true,
        open: true,
        proxy: {
            '/': {
                target: 'https://www.apiopen.top/',
                changeOrigin: true,
            }
        }
    },
    plugins: plugins.concat(utils.plugins),
    devtool: 'cheap-module-eval-source-map'
}
//检测默认端口是否被占用，使用portfinder插件自动更换端口
module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = 8080
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            devWebpackConfig.devServer.port = port
            resolve(devWebpackConfig)
        }
    })
})