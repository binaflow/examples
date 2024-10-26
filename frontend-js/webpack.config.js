const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.js',  // Входной файл
    output: {
        filename: 'bundle.js',  // Имя выходного бандла
        path: path.resolve(__dirname, 'dist'),  // Папка для собранных файлов
        clean: true,  // Очищать папку dist перед новой сборкой
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',  // Шаблон HTML (если его нет, создастся пустой)
        }),
        new CopyPlugin({
            patterns: [
                {from: "assets", to: ""},
            ],
        }),
    ],
    mode: 'development',  // Режим сборки (можно сменить на 'production')
};
