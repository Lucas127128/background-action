import { build } from 'esbuild';

await build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  minify: true,
  outdir: 'dist',
});
