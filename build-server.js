import { build } from 'esbuild';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const dependencies = Object.keys(pkg.dependencies || {});
const externals = dependencies.filter(d => d !== 'adhan');

build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/server.cjs',
  sourcemap: true,
  external: externals
}).catch(() => process.exit(1));
