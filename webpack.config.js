const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const { DefinePlugin } = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: path.join(__dirname, "src", "App.jsx"),
  },
  output: {
    hashFunction: "xxhash64",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    publicPath: "/",
    chunkFilename: "[name].js",
    library: "test-react-amo-app-1",
    libraryTarget: "umd",
  },
  devServer: {
    server: "http",
    static: {
      directory: path.join(__dirname, "dist"),
    },
    hot: true,
    open: true,
    historyApiFallback: true,
    allowedHosts: ["3618-178-159-58-134.ngrok-free.app"],
    port: 3001,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              cacheDirectory: false,
            },
          },
        ],
      },
      {
        test: /\.?(js|jsx)$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "node_modules")],
    extensions: [".js", ".jsx", ".json"],
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "node_modules")],
  },
  optimization: {
    realContentHash: false,
  },
  plugins: [
    new DefinePlugin({
      "process.env.REACT_APP_API_URL": JSON.stringify(
        process.env.REACT_APP_API_URL
      ),
      "process.env.REACT_APP_SERVER_SOCKET_URL": JSON.stringify(
        process.env.REACT_APP_SERVER_SOCKET_URL
      ),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
};
