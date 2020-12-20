var path = require('path');
module.exports = {
    entry: './public/src/game.ts',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'public', 'js'),
        filename: 'game-bundle.js',
        sourceMapFilename: "./game-bundle.js.map",
        pathinfo: true,
    },
    devtool: "source-map",
};