const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlagin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { LoaderOptionsPlugin } = require('webpack');

const isDev = process.env.NODE_ENV === 'development';  // в режиме разработки или нет
const isProd = !isDev;

const optimization = () => {
    const config = {
        runtimeChunk: 'single',
        //splitChunks: {
        //    chunks: 'all'
        //}
    };

    if (isProd) {
        config.minimizer = [
          new TerserWebpackPlugin(),
          new OptimizeCssAssetsWebpackPlugin()
        ];
    }

    return config;
};

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const cssLoaders = (addition) => {
    const loaders = [
        {loader: MiniCssExtractPlagin.loader}, 
        'css-loader'
    ]

    if (addition) loaders.push(addition);

    return loaders;
}

module.exports = {
    mode: 'development',
    // точка отсчета для путей к точкам входа
    context: path.resolve(__dirname, 'src'),
    entry: {
        main: './index.js',
        analytics: './analytics.js'
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        // расширения для интерпретирования файлов, указанных без расширений в коде
        extensions: ['.js', 'json'],
        // алиасы (сокращения) указания путей 
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '~': path.resolve(__dirname, 'node_modules')
        }
    },
    optimization: optimization(),
    devServer: {
        //contentBase: './dist',
        port: 4200,
        hot: isDev,
        open: 'Google Chrome'
        //static: true
    },
    
    target: 'web',//process.env.NODE_ENV === "development" ? "web" : "browserslist"
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/favicon.ico'),
                    to: path.resolve(__dirname, 'dist')
                }
            ]
        }),
        new MiniCssExtractPlagin({
            filename: filename('css')
        })
        
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot)/,
                use: ['file-loader']
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
            }
        ]
    }
};