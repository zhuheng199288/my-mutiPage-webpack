const utils = require('./util');
const path = require('path');
const webpack = require('webpack');
const distDir = path.join(__dirname, '../dist');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 抽取css否则会打包到html中style中
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); //压缩js
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
    new webpack.DefinePlugin({
        'process.env': '"production"'
    }),
    //  压缩css
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
        canPrint: true
    }),
    // 压缩js并且抽取出警告和console
    new UglifyJsPlugin({
        uglifyOptions: {
            compress: {
                warnings: false,
                drop_console: true // 去除console.log日志
            }
        },
        sourceMap: true,
        parallel: true
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
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                //include表示直接去哪些文件夹下面找,可以加快速度
                include: [path.join(__dirname, '../src/js')]
            },
            {
                test: /\.(css|less)$/,
                // loader: 'style-loader!css-loader!px2rem-loader?remUnit=30!less-loader'
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        //  参数importLoaders=1是为了预防css文件里面再import其他css文件，会使得import进来的不会自动加前缀
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        // 自动添加浏览器前缀的插件,
                        {
                            loader: "px2rem-loader",
                            options: {
                                remUnit: 30
                            }
                        },
                        {
                            loader: 'postcss-loader', options: {
                                plugins: function () {
                                    return [
                                        require('postcss-import')(),        //一定要写在require("autoprefixer")前面，否则require("autoprefixer")无效
                                        require("autoprefixer")({ browsers: ['last 100 versions'] })
                                    ]
                                }
                            }
                        },
                        {
                            loader: "less-loader"
                        }
                    ],
                    publicPath: "../"
                })
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                // loader: 'url-loader?limit=4096&name=images/[name]-[hash:5].[ext]',
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 4096,
                            name: 'images/[name]-[hash:5].[ext]'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',// 压缩大于4kb的图片
                        options: {
                            bypassOnDebug: true,
                        }
                    }
                ]
                // use:[{
                //   loader: "file-loader",
                //   options:{
                //     name:'[name]-[hash:5].[ext]',
                //     outputPath:'./images',
                //     publicPath:'./images'
                //   }
                // }]
                /*limit：
                   表示的是一个阀值,如果当前我们资源中的图片大于4kb就从.js中剥离出来，如果小于4kb打包进.js中
                   name:打包出来的图片，放在那个文件夹下，用什么文件名称命名
                   [name]代表你原始的文件名称
                   [hash:5] 让浏览器支持图片的缓存
                   [ext] 图片本身的拓展名
                */
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
    plugins: plugins.concat(utils.plugins)
}
module.exports = devWebpackConfig