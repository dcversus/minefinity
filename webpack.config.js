const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	mode: 'development',

	output: {
		filename: 'bundle-[hash].js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [new HtmlWebpackPlugin({
			title: 'Minefield',
			filename: 'index.html',
			path: './dist',
			template: './src/index.html',
			favicon: './src/assets/flag.png'
		})],
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
		host: '0.0.0.0',
		port: 8080
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true
						}

					}
				],
				exclude: /node_modules/
			},
			{
				test: /\.png$/,
				use:[
					{
						loader: 'file-loader',
						options: {
							name: 'texture-[name]-[hash].[ext]'
						}
					}
				]
			},
		]
	},
	resolve: {
	  extensions: ['.ts', '.js']
	}
};
