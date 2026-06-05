import { build } from 'esbuild';

await build({
  entryPoints: ['index.js'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node24',
  minify: true,
  outdir: 'dist',
});
