import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: [
            '**/*.min.js',
            'dist/**',
            'doc/demo/**',
            'coverage/**',
            'node_modules/**',
            'site/**',
            '.cache/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser },
        },
        rules: {
            'no-var': 'warn',
            'no-nested-ternary': 'warn',
            'no-template-curly-in-string': 'warn',
            'no-self-compare': 'warn',
        },
    },
    {
        files: ['bin/**/*.mjs', '*.config.{js,ts}', 'tst/scss/**'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
)
