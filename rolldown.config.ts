import { defineConfig, RolldownPlugin } from 'rolldown';
import Sonda from 'sonda/rolldown';

export default defineConfig({
  input: 'index.js',
  platform: 'node',
  plugins: [Sonda({ open: false }) as RolldownPlugin],
  output: {
    dir: 'dist',
    format: 'cjs',
    minify: true,
  },
});
