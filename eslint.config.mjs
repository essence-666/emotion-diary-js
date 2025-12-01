import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import stylistic from '@stylistic/eslint-plugin'

export default [
  {
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  {
    ignores: ['stubs/', 'bro.config.js'],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    // plugins: {
    //   '@stylistic': stylistic,
    // },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: true,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],
      semi: ['error', 'never'],
      // Disable react/no-unknown-property for react-three-fiber
      // react-three-fiber uses lowercase props that ESLint doesn't recognize
      'react/no-unknown-property': ['error', { ignore: ['args', 'attach', 'position', 'rotation', 'scale', 'castShadow', 'receiveShadow', 'intensity', 'object', 'map', 'normalMap', 'roughnessMap', 'aoMap', 'displacementMap', 'displacementScale', 'aoMapIntensity', 'roughness', 'metalness', 'transparent', 'opacity', 'side', 'shadow-mapSize', 'shadow-bias', 'shadow-camera-far', 'shadow-camera-left', 'shadow-camera-right', 'shadow-camera-top', 'shadow-camera-bottom', 'shadow-normalBias'] }],
      // '@stylistic/indent': ['error', 2],
    },
  },
]
