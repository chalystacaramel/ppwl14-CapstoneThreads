import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/lambda.ts'],
  outDir: 'dist-lambda',
  format: 'cjs',
  noExternal: [/.*/],
  clean: false,
})