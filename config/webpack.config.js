const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ChromeExtensionReloader = require("webpack-chrome-extension-reloader");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const ManifestConfig = require("./manifest.config.js");

const EXTENSION_DIR = "src/extension/";
const CONSTANT_DIR = "src/constant/";
const SHARED_DIR = "src/shared/";
const CONTEXT_DIR = "src/context/";
const COMPONENTS_DIR = "src/components/";

const config = {
  mode: "production", //| ‘development’ | ‘production’,
  // watch: true | false, 由命令行传入, none|development开启，‘production’关闭
  watchOptions: {
    aggregateTimeout: 300,
    poll: 500,
    ignored: /node_modules/,
  },
  optimization: {
    // minimize: true | false, 由命令行传入, none|development不执行压缩，‘production’执行压缩
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  entry: {
    content: path.resolve(process.cwd(), `${EXTENSION_DIR}content/app.js`),
    background: path.resolve(
      process.cwd(),
      `${EXTENSION_DIR}background/app.js`
    ),
    popover: path.resolve(process.cwd(), `${EXTENSION_DIR}popover/app.js`),
    guide: path.resolve(process.cwd(), `${EXTENSION_DIR}content/guide.js`),
  },
  output: {
    path: path.resolve(process.cwd(), "build"),
    filename: "[name].js",
  },
  resolve: {
    alias: {
      utility: path.resolve(process.cwd(), "src/utility/"),
      context: path.resolve(process.cwd(), `${CONTEXT_DIR}`),
      shared: path.resolve(process.cwd(), `${SHARED_DIR}`),
      components: path.resolve(process.cwd(), `${COMPONENTS_DIR}`),
      extension: path.resolve(process.cwd(), `${EXTENSION_DIR}`),
      constant: path.resolve(process.cwd(), `${CONSTANT_DIR}`),
      background: path.resolve(process.cwd(), `${EXTENSION_DIR}background/`),
      content: path.resolve(process.cwd(), `${EXTENSION_DIR}content/`),
      popover: path.resolve(process.cwd(), `${EXTENSION_DIR}popover/`),
    },
    fallback: {
      fs: false,
      readline: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), "public/html/background.html"),
      title: "chrome-extension",
      filename: "chrome-extension.html",
      chunks: ["background"],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), "public/html/popover.html"),
      title: "chrome-extension",
      filename: "popover.html",
      chunks: ["popover"],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(process.cwd(), "public/"),
          to: path.resolve(process.cwd(), "build"),
          globOptions: {
            ignore: ["**/html/**", "**/css/**"],
          },
        },
        {
          from: path.resolve(process.cwd(), "public/css/inject-cb.css"),
          to: path.resolve(process.cwd(), "build/css/"),
        },
        {
          from: path.resolve(process.cwd(), "public/css/inject-cb-rate.css"),
          to: path.resolve(process.cwd(), "build/css/"),
        },
        {
          from: path.resolve(process.cwd(), "public/css/five-time.css"),
          to: path.resolve(process.cwd(), "build/css/"),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "css/ui.css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(c|s[ac])ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader?-url",
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("autoprefixer")],
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/env", "@babel/preset-react"],
            plugins: [
              "@babel/plugin-proposal-class-properties",
              "@babel/transform-runtime",
            ],
          },
        },
      },
    ],
  },
};

module.exports = (env, argv) => {
  if ("development" === argv.mode) {
    config.plugins.push(
      new ChromeExtensionReloader({
        port: 9092,
        reloadPage: true,
        entries: {
          contentScript: "content",
          background: "background",
          extensionPage: "popover",
        },
      })
    );
  }

  ManifestConfig.version =
    process.env.EXTENSION_VERSION || ManifestConfig.version;
  config.plugins.push(
    new WebpackManifestPlugin({
      generate: () => {
        return ManifestConfig;
      },
    })
  );

  return config;
};
