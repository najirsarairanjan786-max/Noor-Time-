const esbuild = require('esbuild');
esbuild.buildSync({
  stdin: {
    contents: 'console.log(__dirname);'
  },
  outfile: 'dist/out.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs'
});
const { execSync } = require('child_process');
console.log(execSync('node dist/out.cjs').toString());
