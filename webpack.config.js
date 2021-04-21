const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlagin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development';  // в режиме разработки или нет
const isProd = !isDev;

//trying to use 'fs' module for reading the contents of the directory (https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options)
//              'path' module for resolving path segments into absolute path (https://nodejs.org/api/path.html#path_path_join_paths)
function findPathsToFiles(ext, relatedPathToDir) {
    let paths = [];
    const pathToStartDir = path.resolve(__dirname, relatedPathToDir);
    // проверяет файл или папка
    const isFile = (path) => fs.lstatSync(path).isFile();//true or false
    // проверка на требуемое расширение
    const isRequiredExtension = (extention, pathString) => pathString.endsWith(extention); //true or false
    // возвр массив с путями к файлам и папкам
    const findContentPaths = (pathToCurrentDir) => fs.readdirSync(pathToCurrentDir).map(content => path.resolve(pathToCurrentDir, content));
    // возвр массив с путями к файлам
    const findPathsToFiles = (pathsArr) => {
        let currentDirPathsToFiles = [];
        
        pathsArr.forEach(path => {

            if (isFile(path)) {
                isRequiredExtension(ext, path) ? currentDirPathsToFiles.push(path) : '';
            } else {
                currentDirPathsToFiles.push(...separateCurrentDirPaths(path));
            }
            
        });

        return currentDirPathsToFiles;
    };
    // разделить пути текущей папки на файлы и папки
    const separateCurrentDirPaths = (pathToDir) => {
        const contentPaths = findContentPaths(pathToDir);
        const pathsToFiles = findPathsToFiles(contentPaths);

        return pathsToFiles;
    }

    paths.push(...separateCurrentDirPaths(pathToStartDir));

    return paths;
}

const htmlFilePaths = findPathsToFiles('.html', 'src');

//instansces of the htmlWebpackPlugin
const htmlPlugins = htmlFilePaths.map(htmlFile => new HTMLWebpackPlugin({
    template: htmlFile,
    filename: path.basename(htmlFile),
    minify: {
        collapseWhitespace: isProd
    }
}));

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
        analytics: './analytics.ts'
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
        ...htmlPlugins,
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
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
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
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
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