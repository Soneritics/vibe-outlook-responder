const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');
const os = require('os');

// Get Office Add-in dev certificates
const getDevCerts = () => {
  const certPath = path.join(os.homedir(), '.office-addin-dev-certs');
  const certFile = path.join(certPath, 'localhost.crt');
  const keyFile = path.join(certPath, 'localhost.key');
  
  if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
    return {
      cert: fs.readFileSync(certFile),
      key: fs.readFileSync(keyFile),
    };
  }
  return null;
};

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const devCerts = isDevelopment ? getDevCerts() : null;

  return {
    entry: {
      taskpane: './src/taskpane/index.tsx',
      commands: './src/commands/commands.ts',
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name]/[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, '../src'),
      },
    },
    experiments: {
      asyncWebAssembly: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/taskpane/taskpane.html',
        filename: 'taskpane.html',
        chunks: ['taskpane'],
      }),
      new HtmlWebpackPlugin({
        template: './src/taskpane/taskpane.html',
        filename: 'taskpane/taskpane.html',
        chunks: ['taskpane'],
      }),
      new HtmlWebpackPlugin({
        template: './src/commands/commands.html',
        filename: 'commands.html',
        chunks: ['commands'],
      }),
      new HtmlWebpackPlugin({
        template: './src/commands/commands.html',
        filename: 'commands/commands.html',
        chunks: ['commands'],
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
      }),
    ],
    devServer: {
      port: 3000,
      server: devCerts ? {
        type: 'https',
        options: devCerts,
      } : 'https',
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      static: {
        directory: path.join(__dirname, '../dist'),
      },
    },
    devtool: isDevelopment ? 'source-map' : false,
    mode: argv.mode,
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
  };
};
