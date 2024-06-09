import js from "@eslint/js";

export default [
	...js.configs.recommended,
	{
		files: ["src/**/*.js"],
		rules: {
			'prettier/prettier': [
				'error',
				{
					trailingComma: 'none'
				}
			],
			'no-duplicate-imports': 'error'
		},
		extends: [
			'prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
			'plugin:prettier/recommended' // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
		],
		"parserOptions": {
			ecmaVersion: 'ESNEXT', // Allows for the parsing of modern ECMAScript features
			sourceType: 'module' // Allows for the use of imports
		},
		plugins: ["prettier"],
		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.tsx']
			},
			'import/resolver': {
				typescript: {}
			}
		}
	}
]