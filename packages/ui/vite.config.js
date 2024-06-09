import * as dotenv from 'dotenv'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

const { parsed } = dotenv.config()

export default defineConfig({
	esbuild: {
		logOverride: { 'this-is-undefined-in-esm': 'silent' }
	},
    plugins: [createHtmlPlugin({ inject: { data: parsed } })],
	server: {
		port: process.env.PORT,
		https: process.env.HTTPS?.toUpperCase() === 'TRUE' || false
	},
	build: {
		sourcemap: true,
		outDir: './build'
	}
})