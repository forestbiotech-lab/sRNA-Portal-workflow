const path = require('path');
const webpack=require("webpack")

// Globally available examples: https://stackoverflow.com/questions/28969861/managing-jquery-plugin-dependency-in-webpack


module.exports = {
  mode: 'development',
  entry: {
    shared:{
      import: ["./src/index.js","jquery"],
      filename: "webpack.js",
    },
    "cookieconsent":{
      import:["cookieconsent","cookieconsent/build/cookieconsent.min.css"],
      filename: "cookieconsent.js"
    },
    "popper":{
      import: "popper.js",
      dependOn: "shared",
      filename: "popper.js"
    },
    "bootstrap":{
      import: ["bootstrap","bootstrap/dist/css/bootstrap.min.css"],
      dependOn: "shared",
      filename:"bootstrap.js"
    },
    "vue":{
      import: ['vue-select/dist/vue-select.css'],
      filename:'vue.js'
    },
    "canvas-datagrid":{
      import: "canvas-datagrid",
      filename: "canvas-datagrid.js",
    },
    "genoverse":{
      import: ["genoverse"],
      filename: "genoverse.js",
    },
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery",
    }
  },
  plugins: [

  ],
  output: {
    path: path.resolve(__dirname, 'public/webpack'),
  },
  module: {
    rules: [
    {
      test: /\.css$/i,
      use:['style-loader','css-loader']
    },{
      test:/\.js$/,
      enforce: "pre",
      use:['source-map-loader']
    }]
  }
};
