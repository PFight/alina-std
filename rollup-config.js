var nodeResolve = require('rollup-plugin-node-resolve');
var packageJson = require('./package.json');

module.exports = {
  sourceMap: false,
  treeshake: false,
  output: {
    format: 'es'
  },
  name: "alina",
  context: 'window',
  plugins: [
    nodeResolve({
        jsnext: true, main: true, module: true, browser: true
    })
  ],
  external: Object.keys(packageJson.dependencies),
  onwarn: function ( message ) {
    console.warn( message );
  }
};
